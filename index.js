
document.getElementById("signup-form")?.addEventListener("submit", async function (event) {
  try {
    console.log("Signup form submitted!");
    event.preventDefault(); // Prevent page reload

    const entry = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim().toLowerCase(),
      Phone: document.getElementById("Phone").value.trim(),
      restrauntName: document.getElementById("restaurantName").value.trim(),
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
      blogs: []
    };

    // Validate phone number (must be 10 digits)
    if (!/^\d{10}$/.test(entry.Phone)) {
      showFailedToast("Phone number must be exactly 10 digits.");
      return;
    }

    // Validate password length
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(entry.password)) {
      showFailedToast("Password must be at least 8 characters long, atleast 1 special character, number, capital letter, small letter.");
      return;
    }

    // Validate password match
    if (entry.password !== entry.confirmPassword) {
      showFailedToast("Password is not matching");
      return;
    }

    console.log(entry);
    await addUser(entry);
    window.location.href = "dashboard.html";
    sessionStorage.setItem("email", entry.email);
    document.getElementById("signup-form").reset();
  } catch (e) {
    showFailedToast(e);
  }
});



    document.getElementById("login-form")?.addEventListener("submit", async function (event) {
      try {
        console.log("Login form submitted!");
        event.preventDefault();

        const details = {
          email: document.getElementById("email").value.toLowerCase(),
          password: document.getElementById("password").value
        };
        console.log(details.email);
        const value= await checkEmailExists(details.email);
        const emailCheck = value.result;
        console.log(value.result);
        if (!emailCheck) {
          throw new Error("User does not exist");
        }
        console.log(16);
        // const hashedPassword = await hashPassword(details.password);
        console.log(17);
        // const user=getUser(email);
        // console.log(details.password,value.user.password);
        const passVerify = await dcodeIO.bcrypt.compare(details.password,value.user.password);
        if (!passVerify) {
          throw new Error("Wrong Password");
        }

        window.location.href = "dashboard.html";
        sessionStorage.setItem("email", details.email);
      } catch (e) {
        showFailedToast(e);
      }
    });

document.getElementById("blog-submit")?.addEventListener("submit",async function (event) {
  console.log(21);
  event.preventDefault();
  const email = sessionStorage.getItem("email"); // Get logged-in user email
  console.log(email);
  const blogTitle = document.getElementById("title").value.trim();
  const blogContent = document.getElementById("blog").value.trim();
  if (email && blogTitle && blogContent) {
    try {
      console.log("22");
      await addBlog(email, blogTitle, blogContent);
      console.log(23);
      await getAllSubmittedBlogs();
      console.log(24);
      showSuccessToast("Blog added successfully!");
    } catch (error) {
      showFailedToast(error);
    }
    finally{
      document.getElementById("blog-submit").reset();
    }
  } else {
    showFailedToast("Please fill in all fields!");
  }
})


async function getAllSubmittedBlogs() {
  try {
      const blogs = await getAllBlogs();
      console.log(blogs);
      displayBlogs(blogs);
  } catch (error) {
      console.error("Error fetching blogs:", error);
  }
}



document.getElementById("refresh")?.addEventListener("click", getAllSubmittedBlogs);

async function getAllBlogs() {
  return new Promise((resolve, reject) => {
      const request = indexedDB.open("MyDatabase", 3);

      request.onsuccess = function (event) {
          const db = event.target.result;
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
              if (cursor) {
                if(cursor.value.blogs.length>0){
                  users.push({
                      email: cursor.value.email,
                      firstName: cursor.value.firstName,
                      lastName: cursor.value.lastName,
                      blogs: cursor.value.blogs || [] // Ensure blogs exist
                  });
                }
                cursor.continue();
              } else {
                  resolve(users);
              }
          };

          cursorRequest.onerror = function () {
              reject("Error retrieving blogs");
          };
      };

      request.onerror = function () {
          reject("Error opening database");
      };
  });
}

function displayBlogs(users) {
  console.log(users);
  const container = document.getElementById("blogs-container");
  console.log(24);
  container.innerHTML = ""; // Clear previous content

  users.forEach(user => {
    
      const userBlock = document.createElement("div");
      userBlock.classList.add("user-block");
      userBlock.innerHTML = `
          <h3>${user.firstName} ${user.lastName} (${user.email})</h3>
          <div class="blogs-list">
              ${user.blogs.map(blog => `<p><h3>${blog.title}:</h3> ${blog.content}</p>`).join("")}
          </div>
      `;
      container.appendChild(userBlock);
  });
}

document.getElementById("logOut")?.addEventListener("click", async function (event){
  // event.preventDefault(); // Prevent default link behavior

  // Clear session storage
  sessionStorage.clear();

  // Redirect to login page (optional)
  window.location.href = "login.html"; 


});

function showSuccessToast(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "center",
    backgroundColor: "#4CAF50",
    style: {
      background: "linear-gradient(to right, #4CAF50, #2E7D32)",  // Custom background
      color: "#fff",  // Text color
      borderRadius: "8px",
      padding: "10px 20px",
    }
  }).showToast();
}

function showFailedToast(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "center",
    style: {
      background: "linear-gradient(to right,rgb(175, 76, 76),rgb(255, 0, 0))",  // Custom background
      color: "#fff",  // Text color
      borderRadius: "8px",
      padding: "10px 20px",
    }
  }).showToast();
}

function showData(emails) {
  console.log("efg");
  const container = document.getElementById("emailResults");

  // Clear previous results
  container.innerHTML = "";

  // if (emails.length === 0) {
  //   container.innerHTML = "<p>No results found</p>";
  //   return;
  // }

  // Create list items for each email
  
  const ul = document.createElement("ul");
  emails.forEach(email => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#" onclick="handleClick('${email}')">${email}</a>`;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

async function handleClick(email){
  console.log("q");
  let user=await getAllBlogsForEmail(email);
  console.log(user);
  if(user.blogs==null){
    return;
  }
  const container=document.getElementById("blogs-container");
  container.innerHTML="";
  const userBlock = document.createElement("div");
      userBlock.classList.add("user-block");
      userBlock.innerHTML = `
          <h3>${user.firstName} ${user.lastName} (${user.email})</h3>
          <div class="blogs-list">
              ${user.blogs.map(blog => `<p><h3>${blog.title}:</h3> ${blog.content}</p>`).join("")}
          </div>
      `;
      container.appendChild(userBlock);
}


function search(data){
  console.log("abcd");
  const val=getAllUsersByEmailPrefix((x)=>{
    showData(x);
  },data);
}


let timer;
function hitApi(callback,data,limit){
  console.log(123);
  clearTimeout(timer);
  timer=setTimeout(()=>{
    console.log(1234);
   callback();
  },limit);
}

document.getElementById("emailSearcher")?.addEventListener("input",function(event){

  const data=event.target.value;
  console.log(data);
  hitApi(()=>{search(data)},data,300);
})

function throttle(callback,limit){
  let flag=true;
  return function(...args){
    if(flag){
      callback.apply(this,args);
      flag=false;
      setTimeout(()=>{
        flag=true;
      },limit)
    }
  }
}


function getUpdatedDimension(){
  const dimension=document.getElementById("dimensions");
  dimension.textContent=`Width: ${window.innerWidth}px | Height: ${window.innerHeight}px`;
}


if (window.location.pathname.includes("dashboard.html")) {
  window.addEventListener("resize", throttle(getUpdatedDimension, 300));
  window.addEventListener("load", getUpdatedDimension);
  window.addEventListener("load", getAllSubmittedBlogs);
}


