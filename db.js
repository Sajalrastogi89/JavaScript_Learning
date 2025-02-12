let db; // Store database instance

const request = indexedDB.open("MyDatabase", 3);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("Users")) {
    const user=db.createObjectStore("Users", { keyPath: "id", autoIncrement: true }); // Enable autoIncrement
    user.createIndex("email","email",{unique:true});
  }
};

request.onsuccess = function (event) {
  db = event.target.result;
  console.log("Database opened successfully");
};

request.onerror = function () {
  console.error("Error opening database");
};

// **CREATE - Add User**
async function addUser(user) {
  console.log(user);
  try {
    const value= await checkEmailExists(user.email);
    const emailExists = value.result;
    if (emailExists) {
      throw new Error("Email already exists"); // Corrected syntax
    }

    const hashedPassword = await hashPassword(user.password);
    user.password = hashedPassword;

    if (!db) {
      console.error("Database not initialized yet");
      return;
    }

    const transaction = db.transaction("Users", "readwrite");
    const store = transaction.objectStore("Users");

    const request = store.add(user);
    request.onsuccess = () => showSuccessToast("User added successfully");
    request.onerror = (event) => {
      console.error("Error adding user", event.target.error);
      alert("Unable to add");
    };
  } catch (e) {
    throw new Error(e.message);
    // console.error(e);
    // alert(e.message); // Display error message
  }
}


async function hashPassword(password) {
  const saltRounds = 10;
  return await dcodeIO.bcrypt.hash(password, saltRounds);
}

// **READ - Get a User by ID**
function getUser(id, callback) {
  if (!db) {
    console.error("Database not initialized yet");
    return;
  }

  const transaction = db.transaction("Users", "readonly");
  const store = transaction.objectStore("Users");

  const request = store.get(id);
  request.onsuccess = () => callback(request.result);
  request.onerror = () => console.error("Error fetching user");

}

// **READ - Get All Users**
function getAllUsers(callback) {
  if (!db) {
    console.error("Database not initialized yet");
    return;
  }

  const transaction = db.transaction("Users", "readonly");
  const store = transaction.objectStore("Users");

  const request = store.getAll();
  request.onsuccess = () => callback(request.result);
  request.onerror = () => console.error("Error fetching users");
}

// **UPDATE - Update a User**
function updateUser(id, updatedUser) {
  if (!db) {
    console.error("Database not initialized yet");
    return;
  }

  const transaction = db.transaction("Users", "readwrite");
  const store = transaction.objectStore("Users");

  const request = store.get(id);
  request.onsuccess = function () {
    const user = request.result;
    if (!user) {
      console.error("User not found");
      return;
    }

    // Merge updated data
    const updatedData = { ...user, ...updatedUser };
    const updateRequest = store.put(updatedData);

    updateRequest.onsuccess = () => console.log("User updated successfully");
    updateRequest.onerror = () => console.error("Error updating user");
  };
}

// **DELETE - Remove a User**
function deleteUser(id) {
  if (!db) {
    console.error("Database not initialized yet");
    return;
  }

  const transaction = db.transaction("Users", "readwrite");
  const store = transaction.objectStore("Users");

  const request = store.delete(id);
  request.onsuccess = () => console.log("User deleted successfully");
  request.onerror = () => console.error("Error deleting user");
}

// **DELETE - Clear All Users**
function clearAllUsers() {
  if (!db) {
    console.error("Database not initialized yet");
    return;
  }

  const transaction = db.transaction("Users", "readwrite");
  const store = transaction.objectStore("Users");

  const request = store.clear();
  request.onsuccess = () => console.log("All users deleted successfully");
  request.onerror = () => console.error("Error clearing users");
}


// Check Already exsisting email
function checkEmailExists(email) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("Users", "readonly");
    const store = transaction.objectStore("Users");
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.email === email) {
          resolve({"user":cursor.value,"result":true}); // Return true if email exists
        } else {
          cursor.continue();
        }
      } else {
        resolve({"user":null,"result":false}); // Return false if email does not exist
      }
    };

    request.onerror = () => reject("Error checking email");
  });
}





function addBlog(email, blogTitle, blogContent) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("Users", "readwrite");
    const store = transaction.objectStore("Users");
    const index = store.index("email");

    const request = index.get(email);

    request.onsuccess = () => {
      const user = request.result;

      if (!user) {
        reject("User not found!");
        return;
      }

      // Add new blog to the blogs array
      user.blogs.push({ title: blogTitle, content: blogContent });

      // Update user record in IndexedDB
      const updateRequest = store.put(user);

      updateRequest.onsuccess = () => resolve("Blog added successfully!");
      updateRequest.onerror = () => reject("Failed to update user!");
    };

    request.onerror = () => reject("Error retrieving user!");
  });
}



// function verifyPassword(password){
//   return new Promise((resolve, reject) => {
//     const transaction = db.transaction("Users", "readonly");
//     const store = transaction.objectStore("Users");
//     const request = store.openCursor();
//     console.log(password);
//     request.onsuccess = (event) => {
//       const cursor = event.target.result;
//       if (cursor) {
//         console.log("b");
//         if (cursor.value.password === password) {
//           resolve(true); // Return true if email exists
//         } else {
//           cursor.continue();
//         }
//       } else {
//         resolve(false); // Return false if email does not exist
//       }
//     };

//     request.onerror = () => reject("Error checking password");
//   });
// }




// async function hashPassword(password) {
//   const saltRounds = 10;
//   return await bcrypt.hash(password, saltRounds);
// }




async function getAllUsersByEmailPrefix(callback, prefix) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains("Users")) {
      reject("Users object store not found!");
      return;
    }

    const transaction = db.transaction("Users", "readonly");
    const store = transaction.objectStore("Users");

    const users = [];
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor && prefix.length>0) {
        const email = cursor.value.email.toLowerCase();
        if (email.startsWith(prefix.toLowerCase())) {
          users.push(cursor.value.email);
        }
        cursor.continue();
      } else {
        resolve(users);
        if (callback) callback(users); // Execute callback with results
      }
    };

    cursorRequest.onerror = function () {
      reject("Error retrieving users");
    };
  });
}


async function getAllBlogsForEmail(email){
  return new Promise((resolve,reject)=>{
    // if (!db.objectStoreNames.contains("Users")) {
    //   reject("Users object store not found!");
    //   return;
    // }
    if(!db.objectStoreNames.contains("Users")){
      reject("User object store not found");
      return;
    }
    const transaction=db.transaction("Users","readonly");
    const store = transaction.objectStore("Users");
    const index = store.index("email");

    const request = index.get(email);
    request.onsuccess = () => {
      const user = request.result;

      if (!user) {
        reject("User not found!");
        return;
      }
      resolve(user);
    };

    request.onerror = () => reject("Error retrieving user!");
  })
}


// **Example Usage**
// **Testing CRUD Operations**
// getUser(1, console.log);   // Get user with ID 1
// getAllUsers(console.log);  // Get all users
// updateUser(1, { firstName: "Updated" }); // Update user with ID 1
// deleteUser(1);             // Delete user with ID 1
// clearAllUsers();           // Clear all users
