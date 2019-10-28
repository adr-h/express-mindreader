// better name: Express-Mindreader
import {
    Project,
    StructureKind,
    Statement,
    ReturnStatement,
    SyntaxKind,
    CallLikeExpression,
    TypeFormatFlags,
    FunctionDeclaration
} from "ts-morph";
import * as path from 'path';

function getResponseData(handler: FunctionDeclaration) {
    // const statements = sampleHandler.getChildrenOfKind(SyntaxKind.CallExpression);
    const returnStat = handler
                        .getDescendantsOfKind(SyntaxKind.CallExpression)
                        .filter(stat => stat.getText().includes('send'))[0];

    const arg = returnStat.getArguments()[0];
    const argType = arg.getType();
    return {
        text: returnStat.getText(),
        type: argType.isClass() ? argType.getText() : 'Object',
        properties: argType.getProperties().map(prop => ({
            name: prop.getName(),
            type: prop.getTypeAtLocation(returnStat).getText()
        })),
        // arg: {
        //     name: argType.isClass() ? argType.getText() : 'Object',
        //     properties: argType.getProperties().map(prop => ({
        //         name: prop.getName(),
        //         type: prop.getTypeAtLocation(returnStat).getText()
        //     }))
        // },
    };
}

function getRequestData(handler: FunctionDeclaration) {
    const propertyAccess = handler
                        .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
                        .filter(stat => stat.getText().includes('body'))
                        [0];

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
        response: getResponseData(sampleHandler),
        request: getRequestData(sampleHandler),
        method: 'POST',
        path: '/sample',
    }
}
