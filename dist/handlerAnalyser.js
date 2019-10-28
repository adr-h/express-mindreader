"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var ts_morph_1 = require("ts-morph");
function getErrorData(handler) {
    var throwStatements = handler
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.ThrowStatement);
    return throwStatements.map(function (throwStatement) {
        // temporary - code may not always be a "new Error()". could be a simple value. look out.
        var err = throwStatement.getChildren()[1];
        //temporary - should probably just return args and error as-is,
        // allow consumers to use a errorTransformer to turn them into results
        var arg = err.getArguments()[0];
        return {
            text: throwStatement.getText(),
            type: err.getType().getText(),
            properties: [
                {
                    //temporary - very VERY temporary, since it might not a normal Error instance being thrown
                    name: 'message',
                    type: 'string',
                    example: arg.getText()
                }
            ]
        };
    });
}
function getResponseData(handler) {
    // const statements = sampleHandler.getChildrenOfKind(SyntaxKind.CallExpression);
    var returnStats = handler
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.CallExpression)
        .filter(function (stat) { return stat.getText().includes('send'); });
    //temporary - should do more than just checking if it's a "send" call ...
    return returnStats.map(function (returnStat) {
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
    });
}
function getRequestData(handler) {
    var propertyAccess = handler
        .getDescendantsOfKind(ts_morph_1.SyntaxKind.VariableDeclaration)
        .filter(function (stat) { return stat.getText().includes('body'); })[0]; // temporary - should return an array instead of hardcoding anyway
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
        responses: getResponseData(sampleHandler),
        request: getRequestData(sampleHandler),
        errors: getErrorData(sampleHandler),
        method: 'post',
        path: '/sample',
    };
}
exports.default = handlerAnalyser;
