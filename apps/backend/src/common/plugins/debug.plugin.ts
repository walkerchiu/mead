import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';

@Plugin()
export class DebugPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    return {
      async executionDidStart({ request }) {
        console.error(
          '🔍 [DebugPlugin] Execution started:',
          request.operationName,
        );

        return {
          async executionDidEnd(result) {
            console.error('🔍 [DebugPlugin] Execution ended');
            console.error(
              '🔍 [DebugPlugin] Result:',
              JSON.stringify(result, null, 2),
            );
          },

          willResolveField({ info }) {
            console.error(
              `🔍 [DebugPlugin] Resolving field: ${info.parentType.name}.${info.fieldName}`,
            );

            return (result: any) => {
              console.error(
                `🔍 [DebugPlugin] Field resolved: ${info.fieldName} =`,
                result,
              );
            };
          },
        };
      },
    };
  }
}
