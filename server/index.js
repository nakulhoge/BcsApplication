require("dotenv").config();
const express = require("express");
const connectDb = require("./utils/db");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const UsersModel = require("./models/Users");
const FlatModel = require("./models/Flats");
const RoleModel = require("./models/Roles");
const FormDataModel = require("./models/FormData");
const FormFieldModel = require("./models/Forms");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../server/middlewares/authMiddleware");
const adminMiddleware = require("./middlewares/adminMiddleware");
const app = express();
const nodemailer = require("nodemailer");
const CryptoJS = require("crypto-js");
const bodyParser = require("body-parser");
const TaskModel = require("./models/TaskToUser");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());
// Connect to MongoDB
// mongoose.connect("mongodb://localhost:27017/users");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "patilnakul300@gmail.com",
    pass: "usyl kfvw yceb tbdn",
  },
  debug: true,
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // Return numeric OTP
};

const hashPassword = (data) => {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex); // Hash as string
};

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = generateOTP();
    const hashedOTP = hashPassword(otp.toString()); // Hash OTP as a string
    user.otp = hashedOTP;
    await user.save();

    const mailOptions = {
      from: "patilnakul300@gmail.com",
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP for resetting password is ${otp}`,
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email: ", error);
        return res.status(500).json({ message: "Error sending OTP" });
      }
      return res.status(200).json({ message: "OTP sent successfully" });
    });
  } catch (error) {
    console.error("Error in forgot password: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedOTP = hashPassword(otp);
    if (user.otp !== hashedOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    // Hash the new password before updating the user document
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the number of salt rounds
    user.password = hashedPassword;
    user.otp = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset password: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route for handling user registration
app.post("/register", async (req, res) => {
  try {
    // Check if the email already exists in the database
    const existingUser = await UsersModel.findOne({ email: req.body.email });
    if (existingUser) {
      // If email already exists, return an error response
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create a new user with the hashed password
    const newUser = await UsersModel.create({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: hashedPassword, // Save the hashed password
    });

    // Generate JWT token
    // const token = await newUser.generateToken();

    res.status(201).json({
      msg: "User created successfully",
      // token: token,
      userId: newUser._id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for handling user login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UsersModel.findOne({ email: email });

    if (user) {
      // If user exists, compare passwords using bcrypt.compare()
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Passwords match, generate a JWT token
        const token = await user.generateToken();

        // Extract the role property from the user object
        const { role } = user;

        // Fetch role details from the database
        const roles = await RoleModel.findOne({ role });

        if (!roles) {
          return res.status(404).json({ message: "Role not found" });
        }

        // Fetch form fields based on the user's role
        const formFields = await FormFieldModel.find({
          _id: { $in: roles.formFields },
        });

        return res.status(200).json({
          msg: "Login successful",
          token: token,
          userId: user._id.toString(),
          role: role,
          formFields: formFields,
        });
      } else {
        // Passwords don't match
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else {
      // User not found
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    // If an error occurs during the process, return an error response
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/userdata", async (req, res) => {
  // Add leading slash to the route path
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .send({ status: "error", message: "Token is required" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY); // Use process.env.JWT_SECRET_KEY
    const useremail = user.email;

    const data = await UsersModel.findOne({ email: useremail });

    if (!data) {
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });
    }

    return res.status(200).send({ status: "ok", data: data });
  } catch (error) {
    return res
      .status(401)
      .send({
        status: "error",
        message: "Invalid or expired token",
        error: error.message,
      });
  }
});

app.post("/admin_login", async (req, res) => {
  const { email, password } = req.body;
  if (email === "rohan.khandare@walsystems.in" && password === "123") {
    return res.json({ message: "admin login success" });
  } else {
    return res.status(401).json({ message: "Incorrect password" });
  }
});

//Endpoint for superadmin login
app.post("/superadmin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.findOne({ email: email });

    if (!isValidEmail(email)) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (user) {
      // If user exists, compare passwords using bcrypt.compare()
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Passwords match, generate a JWT token
        const token = await user.generateToken();
        return res.status(200).json({
          msg: "Login successful",
          token: token,
          userId: user._id.toString(),
        });
      } else {
        // Passwords don't match
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else {
      // User not found
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    // If an error occurs during the process, return an error response
    return res.status(500).json({ message: "Internal server error" });
  }
});

function isValidEmail(email) {
  const allowedDomain = "rohan.khandare@walsystems.in";
  const domain = email;
  return domain === allowedDomain;
}

//Endpoint to fetch all users from user's schema
app.get("/users", async (req, res) => {
  try {
    //Fetch all users from the database
    const users = await UsersModel.find();

    //Send the user data as a response
    res.status(200).json(users);
  } catch (error) {
    console.log("Error while fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/roles", async (req, res) => {
  try {
    // Fetch all roles from the Role collection
    const roles = await RoleModel.find();
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/roles", async (req, res) => {
  try {
    const { role } = req.body;
    // Check if the role already exists
    const existingRole = await RoleModel.findOne({ role });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }
    // Create a new role
    await RoleModel.create({ role });
    res.status(201).json({ message: "Role added successfully" });
  } catch (error) {
    console.error("Error adding role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//Endpoint to Assign a role to a user
app.put("/assign-role/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Find the user by ID and update their role
    const updatedUser = await UsersModel.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true } // Return the updated user object
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Role assigned successfully", user: updatedUser });
  } catch (error) {
    console.error("Error assigning role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for fetching all admins
app.get("/admins", async (req, res) => {
  try {
    // Find all users with isAdmin set to true
    const admins = await UsersModel.find({ isAdmin: true });
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Remove admin
app.put("/remove-admin/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    // Update user's isAdmin status to false
    await UsersModel.findByIdAndUpdate(userId, { isAdmin: false });
    res.status(200).json({ message: "Admin status removed successfully" });
  } catch (error) {
    console.error("Error removing admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Promote to admin
app.put("/admins/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    // Update user's isAdmin status to true
    await UsersModel.findByIdAndUpdate(userId, { isAdmin: true });
    res.status(200).json({ message: "User promoted to admin successfully" });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for fetching form fields
app.get("/formfields", async (req, res) => {
  try {
    // Fetch all form fields from the FormFieldModel collection
    const formFields = await FormFieldModel.find();
    res.status(200).json(formFields);
  } catch (error) {
    console.error("Error fetching form fields:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for adding a new form field
app.post("/formfields", async (req, res) => {
  try {
    const { fieldName, label, type, required, options, group } = req.body;

    // Create a new form field
    await FormFieldModel.create({
      fieldName,
      label,
      type,
      required,
      options,
      group,
    });
    res.status(201).json({ message: "Form field added successfully" });
  } catch (error) {
    console.error("Error adding form field:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for updating an existing form field
app.put("/formfields/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldName, label, type, required, options } = req.body;

    // Find the form field by ID and update its details
    const updatedField = await FormFieldModel.findByIdAndUpdate(
      id,
      { fieldName, label, type, required, options },
      { new: true } // Return the updated form field object
    );

    if (!updatedField) {
      return res.status(404).json({ message: "Form field not found" });
    }

    res.status(200).json({
      message: "Form field updated successfully",
      field: updatedField,
    });
  } catch (error) {
    console.error("Error updating form field:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for deleting an existing form field
app.delete("/formfields/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the form field by ID and delete it
    const deletedField = await FormFieldModel.findByIdAndDelete(id);

    if (!deletedField) {
      return res.status(404).json({ message: "Form field not found" });
    }

    res.status(200).json({ message: "Form field deleted successfully" });
  } catch (error) {
    console.error("Error deleting form field:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for assigning form fields to roles
app.post("/assignformfields", async (req, res) => {
  try {
    const { roleId, formField } = req.body;
    console.log("Received Role:", roleId);
    console.log("Received Form Field:", formField);

    // Find the role by ID
    const role = await RoleModel.findById(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Check if the form field already exists in the role's formFields array
    const existingFormField = role.formFields.find((field) =>
      field.equals(formField)
    );
    if (existingFormField) {
      return res
        .status(400)
        .json({ message: "Form field already assigned to role" });
    }

    // Assign the form field to the role and save the role
    role.formFields.push(formField);
    await role.save();

    res
      .status(201)
      .json({ message: "Form field assigned to role successfully", role });
  } catch (error) {
    console.error("Error assigning form field to role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Endpoint to fetch all the role allocations
app.get("/roleallocations", async (req, res) => {
  try {
    const roles = await RoleModel.find().populate("formFields").exec();
    const formattedAllocations = roles.map((role) => ({
      roleName: role.role,
      formFields: role.formFields.map((field) => ({
        fieldName: field.fieldName,
        label: field.label,
      })),
    }));
    res.status(200).json(formattedAllocations);
  } catch (error) {
    console.error("Error fetching role allocations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Deleting a form field allocation from a role
app.delete("/roles/:roleId/formfields/:formFieldId", async (req, res) => {
  try {
    const { roleId, formFieldId } = req.params;

    // Find the role by ID
    const role = await RoleModel.findById(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Check if the form field exists in the role's formFields array
    const fieldIndex = role.formFields.indexOf(formFieldId);
    if (fieldIndex === -1) {
      return res
        .status(400)
        .json({ message: "Form field not allocated to this role" });
    }

    // Remove the form field from the role's formFields array
    role.formFields.splice(fieldIndex, 1);
    await role.save();

    res
      .status(200)
      .json({ message: "Form field allocation deleted successfully" });
  } catch (error) {
    console.error("Error deleting form field allocation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for handling product form submission with file upload
app.post("/flatform", upload.single("img"), async (req, res) => {
  const { name, address, requi, latitude, longitude, dateTime } = req.body;
  const img = `${req.file.filename}`;
  console.log(img);
  FlatModel.create({
    name,
    address,
    img,
    requi,
    latitude,
    longitude,
    dateTime,
  })
    .then((flatData) => res.json(flatData))
    .catch((err) => res.json(err));
});

// Route for fetching flat data
app.get("/flatdata", (req, res) => {
  FlatModel.find({})
    .then((flatData) => res.json(flatData))
    .catch((err) => res.status(500).json({ err }));
});
// to display user information
app.get("/user", authMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    // console.log(userData);
    return res.status(200).json({ userData });
  } catch (error) {
    console.log(`error from the user route ${error}`);
  }
});

app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    // Find tasks assigned to the logged-in user based on their email
    const tasks = await TaskModel.find({ assignedTo: req.userID });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(500).json({ error: "Failed to update task status" });
  }
});
//ADMIN
//GET all Users to Admin panel

app.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const allusers = await UsersModel.find({}, { password: 0 });
    if (!allusers || allusers.length === 0) {
      return res.status(404).json({ msg: "no user found" });
    }
    return res.status(200).json(allusers);
  } catch (error) {
    console.error("no data found from database");
  }
});
app.get(
  "/admin/taskToUser",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const allusers = await UsersModel.find({}, { password: 0 });
      if (!allusers || allusers.length === 0) {
        return res.status(404).json({ msg: "no user found" });
      }
      return res.status(200).json(allusers);
    } catch (error) {
      console.error("no data found from database");
    }
  }
);

// GET endpoint to fetch assigned tasks
app.get("/admin/tasks", async (req, res) => {
  try {
    // Fetch assigned tasks and populate the 'assignedTo' field with user names
    const assignedTasks = await TaskModel.find().populate("assignedTo", "name");
    res.status(200).json(assignedTasks);
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete(
  "/admin/tasks/delete/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;
      await TaskModel.deleteOne({ _id: id });
      return res.status(200).json({ msg: "user deleted sucessfully" });
    } catch (error) {
      console.log(error);
    }
  }
);
//GET all flatdata to Admin panel

app.get(
  "/admin/flatdata",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const allflatdata = await FlatModel.find();
      if (!allflatdata || allflatdata.length === 0) {
        return res.status(404).json({ msg: "no flat data found" });
      }
      return res.status(200).json(allflatdata);
    } catch (error) {
      console.error("no flat data found in database");
    }
  }
);

// delete user by id in admin panel

app.delete(
  "/admin/users/delete/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;
      await UsersModel.deleteOne({ _id: id });
      return res.status(200).json({ msg: "user deleted sucessfully" });
    } catch (error) {
      console.log(error);
    }
  }
);

// edit user by id in admin panel
app.put(
  "/admin/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const userId = req.params.id;
    const userDataUpdate = req.body;
    try {
      const userUpdate = await UsersModel.findByIdAndUpdate(
        userId,
        userDataUpdate,
        { new: true }
      );
      if (!userUpdate) {
        return res.status(404).json({ msg: "User not found" });
      }
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user in database:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// POST endpoint to assign task
app.post("/assignTask", async (req, res) => {
  const { userId, task } = req.body;

  try {
    // Create a new Task document
    await TaskModel.create({
      assignedTo: userId,
      task: task,
    });

    res.status(201).json({ message: "Task assigned successfully" });
  } catch (error) {
    // If there is an error, respond with an error message
    console.error("Error assigning task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/submit-form", upload.single("photo"), async (req, res) => {
  try {
    const { role } = req.body;
    const formData = { ...req.body };
    if (req.file) {
      formData.photo = req.file.path; // Store the file path in the form data
    }

    function convertToIST(date) {
      const istOffset = -6.5 * 60 * 60 * 1000; // IST offset in milliseconds
      return new Date(date.getTime() + istOffset);
    }

    // Get the current UTC time
    const utcDate = new Date();
    console.log(utcDate);

    // Convert UTC to IST
    const istDate = convertToIST(utcDate);
    console.log(istDate);

    const newRole = new FormDataModel({
      role,
      formData,
      submitedAt: istDate,
    });
    await newRole.save();

    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "Failed to submit form. Please try again." });
  }
});

app.get("/admin/rolesFormData",async (req, res) => {
  try {
    // Retrieve all submitted form data from the database
    const formData = await FormDataModel.find();

    function convertToIST(date) {
      const istOffset = 6.5 * 60 * 60 * 1000; // IST offset in milliseconds

      return new Date(date.getTime() + istOffset);
    }

    // Convert UTC timestamps to IST
    const submittedFormsIST = formData.map((data) => ({
      ...data.toObject(), // Convert Mongoose document to plain JavaScript object
      submitedAt: convertToIST(data.submitedAt), // Assuming 'submitedAt' is the timestamp field
    }));

    res.status(200).json(submittedFormsIST); // Send response with form data converted to IST
  } catch (error) {
    console.error("Error fetching submitted form data:", error);
    res.status(500).json({ error: "Failed to fetch submitted form data" });
  }
});

const PORT = 3000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`server is runninig at Port: ${PORT}`);
  });
});
