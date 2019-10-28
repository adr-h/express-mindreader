const expressMindreader = require('../index');

const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');

// Swagger Doc generation
const analysisResult = expressMindreader.analyseHandler({
    srcFiles: path.join(__dirname, "handlers"),
    functionFile: path.join(__dirname, "handlers/sampleHandler.js"),
    functionExportName: "handler",
});
const swaggerDocument = expressMindreader.generateSwagger({analysisResult});
// console.log( JSON.stringify(swaggerDocument, null, 2) )
// Swagger Doc Generation End

// Express
const port = 8080;
const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(port, () => {
    console.log(`Sample app listening on port 3000! Visit http://localhost:${port}/api-docs`)
})
// Express end
