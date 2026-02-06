import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import {convertHoppscotchEnvToPostmanEnv, convertHoppscotchToPostmanCollection} from '../src/converter';

const EXPORTED_FILES_DIR = 'hoppscotch_exported_files';
const CONVERTED_FILES_DIR = 'postman_converted_files';
const ENV_FILE = path.join(EXPORTED_FILES_DIR, 'test_env.json');
const COLLECTION_FILE = path.join(EXPORTED_FILES_DIR, 'sample_collection.json');

if (!fs.existsSync(CONVERTED_FILES_DIR)) {
    fs.mkdirSync(CONVERTED_FILES_DIR);
}

if (!fs.existsSync(ENV_FILE) || !fs.existsSync(COLLECTION_FILE)) {
    console.log('Creating missing test files...');
    if (!fs.existsSync(ENV_FILE)) {
        fs.writeFileSync(ENV_FILE, JSON.stringify({
            id: "env_123", name: "Test Environment", variables: [{key: "base_url", value: "http://api.com", secret: false}]
        }));
    }
    if (!fs.existsSync(COLLECTION_FILE)) {
        fs.writeFileSync(COLLECTION_FILE, JSON.stringify({
            v: 2, name: "Sample Collection", folders: [], requests: [], auth: {authType: "none", authActive: true}
        }));
    }
}

console.log('Running tests...');

try {
    console.log('Testing Environment Conversion...');
    const result = convertHoppscotchEnvToPostmanEnv(ENV_FILE, CONVERTED_FILES_DIR);
    
    assert.strictEqual(result.name, 'Test Environment');

    const fileName = path.basename(ENV_FILE, '.json');
    const outputFile = path.join(CONVERTED_FILES_DIR, `${fileName}_postman_environment.json`);
    assert.ok(fs.existsSync(outputFile), `Output environment file should exist at ${outputFile}`);
    
    console.log('✅ Environment Conversion Passed');
} catch (error) {
    console.error('❌ Environment Conversion Failed:', error);
    process.exit(1);
}

try {
    console.log('Testing Collection Conversion...');
    const result = convertHoppscotchToPostmanCollection(COLLECTION_FILE, CONVERTED_FILES_DIR);
    
    assert.strictEqual(result.info.name, 'Sample Collection');

    const fileName = path.basename(COLLECTION_FILE, '.json');
    const outputFile = path.join(CONVERTED_FILES_DIR, `${fileName}_postman_collection.json`);
    assert.ok(fs.existsSync(outputFile), `Output collection file should exist at ${outputFile}`);
    
    console.log('✅ Collection Conversion Passed');
} catch (error) {
    console.error('❌ Collection Conversion Failed:', error);
    process.exit(1);
}

try {
    console.log('Testing Advanced Collection Conversion...');
    const ADVANCED_FILE = path.join(EXPORTED_FILES_DIR, 'advanced_test.json');
    fs.writeFileSync(ADVANCED_FILE, JSON.stringify({
        v: 2, 
        name: "Advanced Collection", 
        folders: [], 
        requests: [
            {
                name: "Root Request",
                method: "POST",
                endpoint: "http://api.com",
                headers: [],
                auth: { authType: "none" },
                body: { contentType: "application/json", body: "{\"foo\":\"bar\"}" }
            }
        ],
        auth: {authType: "none", authActive: true}
    }));

    const result = convertHoppscotchToPostmanCollection(ADVANCED_FILE, CONVERTED_FILES_DIR);
    
    assert.strictEqual(result.item.length, 1, 'Should have 1 root request');
    assert.strictEqual(result.item[0].name, 'Root Request');
    assert.strictEqual(result.item[0].request?.body?.mode, 'raw');
    assert.strictEqual(result.item[0].request?.body?.raw, '{"foo":"bar"}');
    
    console.log('✅ Advanced Collection Conversion Passed');

    fs.unlinkSync(ADVANCED_FILE);
} catch (error) {
    console.error('❌ Advanced Collection Conversion Failed:', error);
    process.exit(1);
}

console.log('Tests completed.');
