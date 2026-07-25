import { server } from "./server"

function main() {
    server.listen(4000, () => {
        console.info("Server is running on http://localhost:4000/graphql")
        /// Added below line for debugging, had an error with undefined db url
        console.log('DATABASE_URL: ', process.env.DATABASE_URL)
    })
}

main()