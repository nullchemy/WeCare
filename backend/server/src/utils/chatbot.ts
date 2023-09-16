import express, { Request, Response } from 'express'
import * as tf from '@tensorflow/tfjs-node'
import { Tokenizer } from 'tokenizers'
import path from 'path'

const router = express.Router()

const modelPath = path.join(__dirname, '../../../Models/electra')
const tokenizerPath = path.join(
  __dirname,
  // eslint-disable-next-line @typescript-eslint/comma-dangle
  '../../../Models/electra/tokenizer.json'
)

let tokenizer: any
let model: any

async function loadTokenizer(t: string) {
  // Load and return the tokenizer
  return Tokenizer.fromFile(t)
}

async function loadModel() {
  tokenizer = await loadTokenizer(tokenizerPath)
  model = await tf.node.loadSavedModel(modelPath, ['serve'], 'serving_default')
}

async function generateResponse(userQuery: string): Promise<string> {
  // Preprocess userQuery using the tokenizer
  const encodedQuery = tokenizer.encode(userQuery)

  // Convert encoded query to tensor
  const inputTensor = tf.tensor([encodedQuery])

  // Generate the model's response
  const responseTensor = (await model.executeAsync(inputTensor)) as tf.Tensor

  // Decode the response tensor to obtain the model's reply
  const decodedResponse = tokenizer.decode(
    // eslint-disable-next-line @typescript-eslint/comma-dangle
    Array.from(responseTensor.dataSync())
  )

  return decodedResponse
}

router.post('/chat', async (req: Request, res: Response) => {
  const userQuery: string = req.body.query

  // Use the Electra model to generate a response
  const response = await generateResponse(userQuery)

  res.json({ response })
})

loadModel()

export default router
