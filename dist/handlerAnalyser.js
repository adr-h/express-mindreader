"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// better name: Express-Mindreader
var ts_morph_1 = require("ts-morph");
var path = __importStar(require("path"));
function getResponseData(handler) {
    // const statements = sampleHandler.getChildrenOfKind(SyntaxKind.CallExpression);
    var returnStat = handler
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.CallExpression)
        .filter(function (stat) { return stat.getText().includes('send'); })[0];
    var arg = returnStat.getArguments()[0];
    var argType = arg.getType();
    return {
        text: returnStat.getText(),
        type: argType.isClass() ? argType.getText() : 'Object',
        properties: argType.getProperties().map(function (prop) { return ({
            name: prop.getName(),
            type: prop.getTypeAtLocation(returnStat).getText()
        }); }),
    };
}
function getRequestData(handler) {
    var propertyAccess = handler
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.VariableDeclaration)
        .filter(function (stat) { return stat.getText().includes('body'); })[0];
    // SyntaxKind.VariableStatement seems different from VariableDEclaration
    // should also probably get propertyaccessexpressions
    // .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    // .filter(stat => stat.getText().includes('body'))[0];
    return {
        text: propertyAccess.getText(),
        type: propertyAccess.getType().getText(undefined, ts_morph_1.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope),
        properties: propertyAccess.getType().getProperties().map(function (prop) { return ({
            name: prop.getName(),
            type: prop.getTypeAtLocation(propertyAccess).getText()
        }); })
    };
}
function handlerAnalyser(_a) {
    var srcFilesDirectory = _a.srcFiles, functionFile = _a.functionFile, functionExportName = _a.functionExportName;
    var project = new ts_morph_1.Project({
        compilerOptions: {
            allowJs: true,
            strict: false
        }
    });
    project.addExistingSourceFiles(path.join(srcFilesDirectory, '/*.js'));
    var sampleHandlerFile = project.getSourceFile(functionFile);
    var sampleHandler = sampleHandlerFile.getFunctionOrThrow(functionExportName);
    return {
        response: getResponseData(sampleHandler),
        request: getRequestData(sampleHandler),
        method: 'post', //temporary - get directly from express App object next time
        path: '/sample', //temporary - get directly from express App object next time
    };
}
exports.default = handlerAnalyser;
