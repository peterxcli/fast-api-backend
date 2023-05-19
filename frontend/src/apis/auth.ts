import config from "@/config"
import { secureFetchApi } from "./utils"

export async function serverLogout() {
    return await secureFetchApi(`${config.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    })
}