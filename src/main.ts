import { server } from "./server"

function main() {
    server.listen(4000, () => {
        console.info("Server is running on http://localhost:4000/graphql")
    })
}

main()