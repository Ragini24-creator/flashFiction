const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, "please enter you name"],
  },

  email: {
    type: String,
    validate: {
      validator: function (v) {
        // Regular expression for email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
    unique: true,
    required: [true, "Please enter your email id! "],
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  profilePicture: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = new mongoose.model("User", userSchema);
module.exports = User;
