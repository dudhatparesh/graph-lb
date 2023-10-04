import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json());

interface GraphDataResponse {
    data: {
        _meta: {
            block: {
                number: number;
            };
        };
        graphnode:string;
        // Other fields based on your GraphQL schema
    };
    // Potential more fields depending on the GraphQL server response structure
}

async function fetchMetaDataFromNode(url: string, subgraphName:string) :
    Promise<{ data: GraphDataResponse | null; error: string | null }> {
    try {
        const response: AxiosResponse = await axios.post(url+subgraphName, {
            query: "query meta{_meta{block{number}}}",
            variables: {},
        });
        return { data: response.data as GraphDataResponse, error: null };
    } catch (error: any) {
        return { data: null, error: error.toString() };
    }
}
async function fetchDataFromNode(url: string, query: string, variables: object, subgraphName: string):
    Promise<{ data: GraphDataResponse | null; error: string | null }> {
    try {
        const response: AxiosResponse = await axios.post(url+subgraphName, {
            query: query,
            variables: variables,
        });
        return { data: response.data as GraphDataResponse, error: null };
    } catch (error: any) {
        return { data: null, error: error.toString() };
    }
}

app.use(async (req: Request, res: Response, next: NextFunction) => {
    const nodes: string[] = process.env.NODE_URLS?.split(',') ?? [];
    console.log(req.url)
    console.log(nodes)
    // Extracting query and variables from the request body
    let { query, variables } = req.body;


    console.log(req.url)

    // Validating if query and variables are provided in request body
    if (!query) {
        return res.status(400).json({ error: 'Query and variables are required in the request body' });
    }

    // Modifying query to add _meta{block{number}} before the last }
console.log(query);

    query = query.trim();
    // get last index of }\n
    const lastIndexOf = query.lastIndexOf('}\n');
    // insert _meta{block{number}} before the last }\n
    query = query.slice(0, lastIndexOf+1) + '_meta{block{number}}' + query.slice(lastIndexOf+1);

    console.log(`Query: ${query}`);
    
    let latestData: GraphDataResponse | null = null;
    let latestBlock: number = -1;
    let latestGraphNode: string = "";
    let graphNodeWithBlocks: { [key: string]: {
        block: number;
        error: string | null;
    } } = {};
    for (let node of nodes) {
        const { data, error } = await fetchMetaDataFromNode(node, req.url);
        console.log(data)
        if (error) {
            console.error(`Error fetching data from ${node}: ${error}`);
            graphNodeWithBlocks[node] = { block: -1, error: error };
            continue;
        }
        
        const currentBlock: number = data?.data._meta.block.number ?? -1;
        if (currentBlock > latestBlock) {
            latestBlock = currentBlock;
            latestData = data;
            latestGraphNode = node;
        }

        graphNodeWithBlocks[node] = { block: currentBlock, error: null };

    }
    
    if (latestData === null) {
        return res.status(500).json({ error: 'Unable to fetch data from any of the node' });
    }
    console.log("fetching data from node: "+latestGraphNode)
    const { data, error } = await fetchDataFromNode(latestGraphNode,query, variables ,req.url);
    if(error){
        return res.status(500).json({ error: 'Unable to fetch data from latestGraphNode'+latestGraphNode });
    }
    return res.status(200).json({ data: data?.data,graphNode:latestGraphNode,subgraphName:req.url, graphNodeWithBlocks: graphNodeWithBlocks });
});

app.post('/get-data', (req: Request, res: Response) => {
    res.json(req);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
