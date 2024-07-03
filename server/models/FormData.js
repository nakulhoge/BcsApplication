const mongoose = require("mongoose");


const formDataSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  formData: {
    type: Object,
    required: true,
  },
  submitedAt: {
    type: Date,
    default: Date.now
  },
});

const FormDataModel = mongoose.model("FormData", formDataSchema);
module.exports = FormDataModel;
