import app from './src/server';

const PORT = process.env.PORT || 443;




app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
