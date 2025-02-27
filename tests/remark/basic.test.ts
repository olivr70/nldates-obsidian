
import remarkParse  from "remark-parse"
import { unified, Processor } from "unified"

describe("remark", () => {
    test("basic parsing", async () => {
        const myRemark = await unified().use(remarkParse )
        const ast1 = myRemark.parse("## Title 2")
        const asText= JSON.stringify(ast1, null, 2)
    })
})