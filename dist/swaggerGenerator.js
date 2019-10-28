"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    for (var _d = 0, _e = analysisResult.responses; _d < _e.length; _d++) {
        var resp = _e[_d];
        for (var _f = 0, _g = resp.properties; _f < _g.length; _f++) {
            var param = _g[_f];
            responses[param.name] = {
                type: param.type
            };
        }
    }
    var errorResponses = {};
    for (var _h = 0, _j = analysisResult.errors; _h < _j.length; _h++) {
        var err = _j[_h];
        var code = err.code || '500';
        errorResponses[code] = {
            "description": code + " response",
            "schema": {
                "type": "object",
                "properties": {}
            }
        };
        for (var _k = 0, _l = err.properties; _k < _l.length; _k++) {
            var param = _l[_k];
            errorResponses[code].schema.properties[param.name] = {
                type: param.type,
                example: param.example,
            };
        }
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
            "responses": __assign({ "200": {
                    "description": "200 response",
                    "schema": {
                        "type": "object",
                        "properties": responses
                    }
                } }, errorResponses)
        },
        _b);
    return swaggerDoc;
}
exports.default = generateSwaggger;
