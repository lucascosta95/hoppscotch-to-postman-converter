import * as fs from 'fs';
import * as path from 'path';
import {
  convertHoppscotchEnvToPostmanEnv,
  convertHoppscotchToPostmanCollection,
  processCollectionConversion
} from './converter';

const EXPORTED_FILES_DIR = 'hoppscotch_exported_files';
const CONVERTED_FILES_DIR = 'postman_converted_files';

if (!fs.existsSync(CONVERTED_FILES_DIR)) {
    fs.mkdirSync(CONVERTED_FILES_DIR);
}

if (fs.existsSync(EXPORTED_FILES_DIR)) {
  const files = fs.readdirSync(EXPORTED_FILES_DIR);

  files.forEach((file) => {
    if (!file.endsWith('.json')) return;
    if (file.includes('_postman_environment') || file.includes('_postman_collection')) return;

    const filePath = path.join(EXPORTED_FILES_DIR, file);
    console.log(`Processing ${filePath}...`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(content);

      if (Array.isArray(json)) {
          let isCollectionArray = true;
          for(const item of json) {
              if (!item.folders && !item.requests) {
                  isCollectionArray = false;
                  break;
              }
          }
          
          if (isCollectionArray) {
              console.log(`Detected array of ${json.length} collections in ${file}`);
              json.forEach((collection, index) => {
                  const safeName = collection.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                  console.log(`Converting collection ${index + 1}/${json.length}: ${collection.name}`);
                  processCollectionConversion(collection, filePath, CONVERTED_FILES_DIR, `${safeName}_${index}`);
              });
          } else {
               console.warn(`Skipping ${file}: Array format detected but content is not recognized as Hoppscotch collections`);
          }

      } else if (json.variables && Array.isArray(json.variables)) {
          convertHoppscotchEnvToPostmanEnv(filePath, CONVERTED_FILES_DIR);
      } else if (json.folders || json.requests) {
          convertHoppscotchToPostmanCollection(filePath, CONVERTED_FILES_DIR);
      } else {
          console.warn(`Skipping ${file}: Unknown format (neither Environment nor Collection)`);
      }
    } catch (error) {
      console.error(`Error converting ${file}:`, error);
    }
  });
} else {
  console.log(`Directory '${EXPORTED_FILES_DIR}' not found. Please create it and place your JSON files there.`);
}
