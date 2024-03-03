## Specsy.store: E-commerce App

**Description:**

Welcome to Specsy.store, your one-stop online shop for eyeglasses! This project showcases amazing features for a seamless shopping experience, including:




* **Easy Registration with OTP:** Securely sign up with One-Time Password verification.
* **Smart Search and Filter:** Find your perfect eye frames with categories, genders, and price filters.
* **Smooth Shopping Experience:** Enjoy shopping with convenient cart and wishlist features.
* **Multiple Payment Options:** Choose from UPI, Cards, Net Banking, Pay Later, Cash on Delivery, or Wallet payments.
* **Order Tracking and Management:** Track your orders in real-time, and manage cancellations, returns, or refunds effortlessly.
* **Wallet Integration:** Streamline purchases and track transactions securely with a built-in wallet.
* **Coupon System:** Save money with special offers and coupons.
* **Forgot Password:** Easily recover your password for uninterrupted access.

![Image description](https://github.com/arshadakl/assets/blob/main/specsy-home.png?raw=true)

![Image description](https://github.com/arshadakl/assets/blob/main/specsy-shop.png?raw=true)

**Admin Control Features:**

* **User Management:** Admins can handle user accounts (block/unblock) for security purposes.
* **Order Handling:** Admins gain full control over viewing, modifying, and managing orders.
* **Product Administration:** Admins can add, edit, or delete products, images, and manage stock levels.
* **Category Oversight:** Admins can efficiently manage product categories based on market trends.
* **Coupon and Banner Supervision:** Admins create, edit, or deactivate coupons and banner images.
* **Sales Reporting and Revenue Analytics:** Gain insights into sales performance with visualized reports and track revenue and costs.

![Image description](https://github.com/arshadakl/assets/blob/main/specsy-admin.png?raw=true)

**Tech Stack:**

* **Backend:** Node.js, Express.js
* **Frontend:** EJS
* **Database:** MongoDB

**Get Started:**

1. **Clone the Project:**

   ```bash
   git clone https://github.com/arshadakl/specsy.git
   ```

2. **Create and Configure the `.env` File:**

   - **Create:** After cloning the project, create a new file named `.env` in the project's root directory.
   - **Important Note:** **DO NOT** commit this file to your version control system (e.g., Git) as it contains sensitive information like API keys and passwords.
   - **Configuration:** Add the following lines to the `.env` file, replacing the placeholders with your actual values:

     ```
     MAIL_KEY=
     MAIL_USER=
     OTP_HOST=smtp.gmail.com
     MAIL_PORT=

     # MongoDB connection string (replace with your actual connection details)
     DB_HOST=mongodb://localhost:27017/specsy

     # Razorpay API keys (replace with your actual keys)
     RAZORPAY_KEY_ID=
     ```

3. **Install Dependencies:**

   Change directories into the project folder:

   ```bash
   cd specsy.store
   ```

   Install the project's dependencies using npm:

   ```bash
   npm install
   ```

4. **Run the Project:**

   Start the development server using npm:

   ```bash
   npm start
   ```

This will launch the application, and you can access it in your browser, typically at http://localhost:3000 

**Visit my Web Store:** [https://specsy.store](https://specsy.store)