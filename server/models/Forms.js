const mongoose = require('mongoose');

const FormFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'number', 'email', 'select', 'checkbox', 'radio', 'date','file'],
    default: 'text'
  },
  options: {
    type: [String], // Only applicable for select, checkbox, and radio types
    default: []
  },
  required: {
    type: Boolean,
    default: false
  },
  group:{
    type:String,
    required:true
  },
  latitude: {
    type: Number
   
  },
  longitude: {
    type: Number
    
  },
  
  // Add any other fields you may need, such as validation rules, etc.
}, { timestamps: true });

const FormFieldModel = mongoose.model("forms", FormFieldSchema);

module.exports = FormFieldModel;
