export default function handler(req, res) {
    if (req.method === 'POST') {
      // Handle file upload logic here
      res.status(200).json({ message: 'Upload successful' });
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  }
  