import * as path from 'path';
import {
    Project,
    StructureKind,
    Statement,
    ReturnStatement,
    SyntaxKind,
    CallLikeExpression,
    TypeFormatFlags,
    FunctionDeclaration,
    CallExpression
} from "ts-morph";
import { isThrowStatement, isFunctionOrConstructorTypeNode, isFunctionExpression, isCallOrNewExpression } from 'typescript';

function getErrorData(handler: FunctionDeclaration) {
    const throwStatements = handler
                                .getDescendantsOfKind(SyntaxKind.ThrowStatement);

    return throwStatements.map((throwStatement) => {
        // temporary - code may not always be a "new Error()". could be a simple value. look out.
        const err = throwStatement.getChildren()[1] as CallExpression;

        //temporary - should probably just return args and error as-is,
        // allow consumers to use a errorTransformer to turn them into results
        const arg = err.getArguments()[0];

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
    })
}

function getResponseData(handler: FunctionDeclaration) {
    // const statements = sampleHandler.getChildrenOfKind(SyntaxKind.CallExpression);
    const returnStats = handler
                        .getDescendantsOfKind(SyntaxKind.CallExpression)
                        .filter(stat => stat.getText().includes('send'));
                        //temporary - should do more than just checking if it's a "send" call ...

    return returnStats.map((returnStat) => {
        const arg = returnStat.getArguments()[0];
        const argType = arg.getType();
        return {
            text: returnStat.getText(),
            type: argType.isClass() ? argType.getText() : 'Object',
            properties: argType.getProperties().map(prop => ({
                name: prop.getName(),
                type: prop.getTypeAtLocation(returnStat).getText()
            })),
        };
    });
}

function getRequestData(handler: FunctionDeclaration) {
    const propertyAccess = handler
                        .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
                        .filter(stat => stat.getText().includes('body'))
                        [0]; // temporary - should return an array instead of hardcoding anyway

                        // SyntaxKind.VariableStatement seems different from VariableDEclaration
                        // should also probably get propertyaccessexpressions
                        // .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
                        // .filter(stat => stat.getText().includes('body'))[0];

    return {
        text: propertyAccess.getText(),
        type: propertyAccess.getType().getText(undefined, TypeFormatFlags.UseAliasDefinedOutsideCurrentScope),
        properties: propertyAccess.getType().getProperties().map(prop => ({
            name: prop.getName(),
            type: prop.getTypeAtLocation(propertyAccess).getText()
        }))
    }
}

export default function handlerAnalyser ({
    srcFiles: srcFilesDirectory, functionFile, functionExportName
}){
    const project = new Project({
        compilerOptions: {
            allowJs: true,
            strict: false
        }
    });

    project.addExistingSourceFiles(path.join(srcFilesDirectory, '/*.js'));
    const sampleHandlerFile = project.getSourceFile(functionFile);
    const sampleHandler = sampleHandlerFile.getFunctionOrThrow(functionExportName);

    return {
        responses: getResponseData(sampleHandler),
        request: getRequestData(sampleHandler),
        errors: getErrorData(sampleHandler),
        method: 'post', //temporary - should just pass in an Express App and get routing info from it
        path: '/sample', //temporary - should just pass in an Express App and get routing info from it
    }
}
