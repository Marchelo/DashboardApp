// Prvo Radimo Fetcher kako bi olaksali dalji rad sa podacima
import {GraphQLFormattedError} from "graphql";

type Error = {
    message: string;
    statusCode: string;
}


// Pravimo nas custom fetch, kako bi olaksali dalji rad
const cFetch = async (url:string, options: RequestInit) => {
    // AUTH HEADER
    const accessToken = localStorage.getItem('access_token');

    const headers = options.headers as Record<string,string>;

    //BUG
    return await fetch(url, {
        ...options,
        headers: {
            ...headers,
            Authorization: headers?.Authorization || `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            //APOLLO 
            "Apollo-Require-Preflight": "true",
        }
    })
}




// Nas Custom ERROR HANDLING
const getGraphQLErrors = (body:Record <"errors", GraphQLFormattedError[] | undefined>): 
Error | null => {
    if(!body){
        return{
            message: 'Unknown Error',
            statusCode: "INTERNAL_SERVER_ERROR"
        }
    }
    if("errors" in body){
        // Uzmi error-e u body
        const errors = body?.errors;

        // Spoji error-e
        const messages = errors?.map((error) => error?.message)?.join("|");
        const code = errors?.[0]?.extensions?.code;

        return {
            message: messages || JSON.stringify(errors),
            // 500 Ako ne znamo koji je kod
            statusCode: code || 500
        }
    }

    return null;
}

// Spajamo cFetch i Error Handler

// BUG
export const fetchWrapper = async (url:string, options: RequestInit) => {
    const response = await cFetch(url, options);
    // Kloniramo response Objekat kako bi mogli da iskoristimo isti
    // response na vise nacina, jer kada je response procitan,
    // on se smatra konzumiranim. Zato nam treba klon
    const responseClone = response.clone();
    const body = await responseClone.json();
    const error = getGraphQLErrors(body);
    if(error){
        throw error;
    }
    return response;
}