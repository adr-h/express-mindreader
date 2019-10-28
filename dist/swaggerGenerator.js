"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBoilerplate() {
    return {
        "swagger": "2.0",
        "info": {
            "title": "Your API Name Here",
            "version": "1.0"
        },
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "paths": {}
    };
}
function generateSwaggger(_a) {
    var _b;
    var analysisResult = _a.analysisResult;
    var swaggerDoc = getBoilerplate();
    var parameters = {};
    for (var _i = 0, _c = analysisResult.request.properties; _i < _c.length; _i++) {
        var param = _c[_i];
        parameters[param.name] = {
            type: param.type
        };
    }
    var responses = {};
    for (var _d = 0, _e = analysisResult.response.properties; _d < _e.length; _d++) {
        var param = _e[_d];
        responses[param.name] = {
            type: param.type
        };
    }
    swaggerDoc.paths[analysisResult.path] = (_b = {},
        _b[analysisResult.method] = {
            "consumes": ["application/json"],
            "produces": ["application/json"],
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
        },
        _b);
    return swaggerDoc;
}
exports.default = generateSwaggger;
