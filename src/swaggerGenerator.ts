
function getBoilerplate() {
    return {
        "swagger": "2.0",
        "info": {
            "title": "Your API Name Here",
            "version": "1.0"
        },
        "consumes": [ "application/json" ],
        "produces": [ "application/json" ],
        "paths": { }
    };
}

export default function generateSwaggger({
    analysisResult,
}) {
    const swaggerDoc = getBoilerplate();

    const parameters = {};
    for (const param of analysisResult.request.properties) {
        parameters[param.name] = {
            type: param.type
        }
    }

    const responses = {};
    for (const param of analysisResult.response.properties) {
        responses[param.name] = {
            type: param.type
        }
    }

    swaggerDoc.paths[analysisResult.path] = {
        [analysisResult.method]: {
            "consumes": [ "application/json" ],
            "produces": [ "application/json" ],
            "parameters": [
                {
                  "name": "body",
                  "in": "body",
                  "description": "Request Body",
                  "schema": {
                    "type": "object",
                    "properties": parameters
                  }
                }
            ],
            "responses": {
                "200": {
                    "description": "200 response",
                    "schema": {
                        "type": "object",
                        "properties": responses
                    }
                }
            }
        }
    }

    return swaggerDoc;
}