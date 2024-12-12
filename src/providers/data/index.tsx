import graphqlDataProvider, { 
    GraphQLClient,
    liveProvider as graphqlLiveProvider,
} from "@refinedev/nestjs-query";
import { fetchWrapper } from "./fetchWrapper";
import { createClient } from "graphql-ws";

// BASE URL
export const API_BASE_URL = 'https://api.crm.refine.dev'
// URL GraphQL API-a koji uzimamo od REFINE
// Promenio sam API_URL EndPoint, da ne bude isti kao Base API
export const API_URL = `${API_BASE_URL}/graphql`;
// URL WebSocket-a koji uzimamo od REFINE 
export const WS_URL = 'wss://api.crm.refine.dev/graphql';


// GraphQL Client koji salje Request do GraphQL API
export const client = new GraphQLClient(API_URL, {
    fetch: (url:string, options: RequestInit) => {
        try {
            // fetchWrapper je u fajlu fetchWrapper.ts
            // BUG
            return fetchWrapper(url, options);
        } catch (error) {
            return Promise.reject(error as Error);
        }
    }

});

// Kako bi se promene na stranici odmah desavale,  
// bez refresh-a, treba da napravimo SOCKET
// To cemo preko Refine, zato sto on ima BuiltIn LIVEPROVIDER

export const webSocket = typeof window !== "undefined"
    ? createClient({
        url: WS_URL,
        connectionParams: () => {
            const accessToken = localStorage.getItem("access_token");

            return{
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        }
    }) : undefined

// DATA PROVIDER
export const dataProvider = graphqlDataProvider(client);
// LIVE PROVIDER
export const liveProvider = webSocket ? graphqlLiveProvider(webSocket) : undefined;