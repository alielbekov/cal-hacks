import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
import { OpenAI } from 'openai'; // Import OpenAI
import express from 'express';
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Middleware to parse JSON bodies
app.use(express.json());

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});


// feel to expand
const mustHaves = [
        "Window access",
        "Cozy corners",
        "Pet friendly furniture",
        "Easy-to-clean surface",
        "Feeding stations",
        "Safety measures"
]


const houseDescription = "A charming 3-bedroom, 2-bathroom house located in a quiet neighborhood. The home features \
  hardwood floors throughout, a spacious living room with large windows, and a modern kitchen with stainless steel \
  appliances. The backyard is fully fenced, offering plenty of space for pets to play. Additionally, the house is \
  situated within walking distance of a large public park with walking trails and a dog park. The property also includes \
  a mudroom, ideal for cleaning up pets before entering the main living space."


async function analyzePetFriendliness(houseDescription, mustHaves) {
  try {
    // Send the prompt to the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or the latest available model
      messages: [{"role": "system", "content": "You are an assistant. Given a description of a house, evaluate its pet-friendliness based on the following \
      criteria: "+ mustHaves.join(', ') + ". Is this house pet-friendly? Please explain."},
      {"role": "user", "content": houseDescription},
      ],
    });

    // Log the result
    console.log(response.choices[0]);
   
    return response.choices[0];
  } catch (error) {
    console.log("Error calling the OpenAI API:", error);    
    
  }
}


app.post('/get-feedback', (req, res) => {
  let houseDescription = req.body.message;
  analyzePetFriendliness(houseDescription, mustHaves)
  .then(result => {
    console.log(result);
    res.end( JSON.stringify(result, undefined, 2) );
  })
  .catch(error =>{
    console.log(error);
    res.end("FAIL");
  })
  



});