const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let axios = require('axios');
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  try{  
    const {username, password} = req.body;
    if(!username || !password) {
      return res.status(400).json({message:"Invalid username or password"});
    }

    if(!isValid(username)){
      return res.status(400).json({message:"Invalid username"});
    }

    if (users.some(user => user.username === username)){
      return res.status(400).json({message:"Username already exists"});
    }

    users.push({username, password});
    return res.status(200).json({message:"User registered successfully"});
  } catch(e){
    console.error('Error in register:', e);
    return res.status(500).json({message:"Internal server error"});
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

function getBooks(){
  axios.get('http://localhost:5001/')
  .then((response) => {
    console.log("Book list:",response.data);
  })
  .catch((error) => {
    console.error("Error in getBooks:",error);
  });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(book){
    return res.status(200).json(book);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
 });

 function getBookDetails(isbn){
  axios.get(`http://localhost:5001/isbn/${isbn}`)
  .then((response) => {
    console.log("Book details:",response.data);
  })
  .catch((error) => {
    console.error("Error in getBookDetails:",error);
  });
}
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const results = Object.values(books).filter(book => book.author === author);
  if (results.length === 0){
    return res.status(404).json({message: "Author not found"});
  } else {
    return res.status(200).json(results);
  }
});


function getBookByAuthor(author){
  axios.get(`http://localhost:5001/author/${author}`)
  .then((response) => {
    console.log("Books by author:",response.data);
  })
  .catch((error) => {
    console.error("Error in getBookByAuthor:",error);
  });
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const results = Object.values(books).filter(book => book.title === title);
  if (results.length === 0){
    return res.status(404).json({message: "Title not found"});
  } else {
    return res.status(200).json(results);
  }
});

function getBookByTitle(title){
  axios.get(`http://localhost:5001/title/${title}`)
  .then((response) => {
    console.log("Books by title:",response.data);
  })
  .catch((error) => {
    console.error("Error in getBookByTitle:",error);
  });
}

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const review = books[isbn].reviews;
  if(review){
    return res.status(200).json(review);
  } else {
    return res.status(404).json({message: "Review not found"});
  }
});

module.exports.general = public_users;
