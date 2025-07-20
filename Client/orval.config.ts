import { defineConfig } from 'orval';

export default defineConfig({
  'picnic-planner-api': {
    input: {
      target: 'http://localhost:5000/swagger/v1/swagger.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/hooks/api.ts',
      // Explicitly set the path to the /generated folder for custom and generated types
      schemas: './src/types/generated', 
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: './src/services/api-client.ts',
          name: 'customInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
  'picnic-planner-zod': {
    input: {
      target: 'http://localhost:5000/swagger/v1/swagger.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/schemas',
      client: 'zod',
      fileExtension: '.zod.ts',
    },
  },
}); 