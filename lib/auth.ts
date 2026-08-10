import {betterAuth} from 'better-auth';
import { genericOAuth, keycloak } from 'better-auth/plugins';
export const auth=betterAuth({
    baseUrl:process.env.BETTER_AUTH_URL,
    secret:process.env.BETTER_AUTH_SECRET,
    plugins:[
        genericOAuth({
            config:[
                keycloak({
                    clientId:`${process.env.KEYCLOAK_CLIENT_ID}`,
                    clientSecret:`${process.env.KEYCLOAK_CLIENT_SECRET}`,
                    issuer:`${process.env.KEYCLOAK_ISSUER}`,
                    redirectURI:`${process.env.BETTER_AUTH_URL}/api/auth/oauth2/callback/keycloak`,
                    pkce:true
                })
            ]
        })
    ],
    account:{
        storeStateStrategy:'cookie'
    }
})