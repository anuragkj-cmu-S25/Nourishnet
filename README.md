# NourishNet

A mobile-first web application designed to streamline daily operations for food banks and their volunteers.

##### [Style Guide](https://www.figma.com/proto/atcHOcQUDxep4uT64E7iVD/Untitled?node-id=2-2&p=f&t=TzVTnmNzUZDfflKb-0&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1)
---

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🎉 Acknowledgments](#-acknowledgments)

---

## About the Project

Food banks are vital to our communities, but they often rely on manual, fragmented processes for managing inventory, coordinating volunteers, and handling communications. This can lead to operational bottlenecks, wasted resources, and difficulty in scaling their impact.

**NourishNet** is a centralized operational hub designed for a single food bank, providing both staff and volunteers with the tools they need to work together efficiently. It replaces spreadsheets and text message chains with a real-time, collaborative platform, ensuring that everyone is on the same page.

This project was developed for the **Software Requirements and Interaction Design** course at Carnegie Mellon University.

---

## ✨ Key Features

NourishNet provides a role-based experience tailored to the specific needs of each user group.

#### For Food Bank Staff:
*   **👤 Role-Based Authentication:** Secure login for staff and volunteers.
*   **📊 Real-time Dashboard:** An at-a-glance overview of key metrics, including items in stock, unread messages, and high-priority items to restock.
*   **📦 Smart Inventory Management:** Track all food items, with automated "low stock" alerts to prevent shortages.
*   **🛒 Collaborative Sourcing List:** Create a daily sourcing list of needed items and monitor its fulfillment by volunteers in real-time.
*   **✅ Shared Task Management:** A central to-do list for all staff members to coordinate daily operational tasks.
*   **📨 Internal Communication Hub:** A shared inbox to manage incoming donation offers and forward key information directly to volunteers within the app.

#### For Volunteers:
*   **📝 Live Sourcing List:** View the food bank's needs in real-time and update the quantity of items you've sourced on the go.
*   **📥 Personal Inbox:** Receive messages and tasks forwarded directly from food bank staff.
*   **🗓️ Personal Calendar:** Automatically generate calendar events from forwarded messages to keep track of deliveries and appointments.
*   **👤 Profile Management:** Manage your personal details and availability.

---

## 🛠️ Tech Stack

This project is built with a modern, scalable, and real-time capable technology stack.

| Category      | Technology                                                                          |
|---------------|-------------------------------------------------------------------------------------|
| **Frontend**  | [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **UI Library**| [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)             |
| **Backend**   | [Supabase](https://supabase.io/) (Postgres, Auth, Realtime Subscriptions)             |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   **Node.js** (v18 or later)
*   **npm** or **yarn**
*   A free **Supabase** account ([signup here](https://supabase.com/))

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/NourishNet.git
    cd NourishNet
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up your Supabase project:**
    *   Create a new project on your Supabase dashboard.
    *   Navigate to the **SQL Editor** and run the database schema scripts provided in the project's technical documentation to create the necessary tables.

4.  **Configure Environment Variables:**
    *   Create a new file named `.env.local` in the root of the project.
    *   Copy the contents of `.env.example` (if provided) or use the template below.
    *   Find your Project URL and anon key in your Supabase project's **Settings > API** section.

    ```env
    # .env.local

    VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

5.  **Run the application:**
    ```sh
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

---


## 🎉 Acknowledgments

*   This project was developed as part of the **Software Requirements and Interaction Design** course at Carnegie Mellon University.
*   Special thanks to our interview participants from local food banks for their invaluable insights.
