import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { apiFetch } from "../api";

export default function ManageItemsPage() {
  const navigate = useNavigate();
  const [action, setAction] = useState("Add");
  const [itemType, setItemType] = useState("Book");
  const userType = sessionStorage.getItem("userType");
  const isStaff = userType === "staff";
  const isAdmin = userType === "admin";
  const [bookForm, setBookForm] = useState({
    item_name: "",
    author_firstName: "",
    author_lastName: "",
    publisher: "",
    language: "",
    year_published: "",
    num_copies: 1,
  });

  const [cdForm, setCdForm] = useState({
    item_name: "",
    cd_type: "",
    rating: "",
    release_date: "",
    genre: "",
    num_copies: 1,
  });

  const [deviceForm, setDeviceForm] = useState({
    name: "",
    deviceType: "",
  });

  const [removeForm, setRemoveForm] = useState({
    itemId: "",
    copyId: "",
    reason: "",
  });

  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setBookForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCdChange = (e) => {
    const { name, value } = e.target;
    setCdForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeviceChange = (e) => {
    const { name, value } = e.target;
    setDeviceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRemoveChange = (e) => {
    const { name, value } = e.target;
    setRemoveForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBook = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");
      const payload = {
        ...bookForm,
        item_type: 1,
        year_published: bookForm.year_published
          ? new Date(bookForm.year_published).toISOString().split("T")[0]
          : null,
        num_copies: Number(bookForm.num_copies),
    };
    console.log("Sending payload:", payload);
      const response = await apiFetch("/api/items",  {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || data.message || "Failed to add book");
      }

      alert("Book added successfully.");

      setBookForm({
        item_name: "",
        author_firstName: "",
        author_lastName: "",
        publisher: "",
        language: "",
        year_published: "",
        num_copies: 1,
      });
    } catch (error) {
      console.error("Error adding book:", error);
      alert(error.message || "Error adding book.");
    }
  };

  const handleAddCd = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      const payload = {
        ...cdForm,
        item_type: 2,
        cd_type: cdForm.cd_type ? parseInt(cdForm.cd_type, 10) : null,
        rating: cdForm.rating ? parseInt(cdForm.rating, 10) : null,
        num_copies: Number(cdForm.num_copies),
      };
      const response = await apiFetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || data.message || "Failed to add CD");
      }

      alert("CD added successfully.");

      setCdForm({
        item_name: "",
        cd_type: "",
        rating: "",
        release_date: "",
        genre: "",
        num_copies: 1,
      });
    } catch (error) {
      console.error("Error adding CD:", error);
      alert(error.message || "Error adding CD.");
    }
  };

  const handleAddDevice =  async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      const payload = {
        item_name: deviceForm.name,
        item_type: 3,
        device_type: deviceForm.deviceType ? parseInt(deviceForm.deviceType, 10) : null,
    };
    const response = await apiFetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.details || data.message || "Failed to add device");
    }

    alert("Device added successfully.");

    setDeviceForm({
      name: "",
      deviceType: "",
    });
    } catch (error) {
      console.error("Error adding device:", error);
      alert(error.message || "Error adding device.");
    }
  };

  const handleRemoveItem = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      const response = await apiFetch(`/api/items/${removeForm.itemId}/copies/${removeForm.copyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || data.message || "Failed to remove item");
      }

      alert("Item copy has beenremoved successfully.");

      setRemoveForm({
        itemId: "",
        copyId: "",
        reason: "",
      });
    } catch (error) {
      console.error("Error removing copy:", error);
      alert(error.message || "Error removing copy.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationBar isStaff={true}/>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/*back button*/}
        <button
          onClick={() => navigate(isAdmin ? "/admin" : isStaff ? "/staff" : "/view-account")}
          className="text-sm text-green-900 font-semibold hover:underline mb-6 inline-block"
        >
          ← Back
        </button>

        {/*title*/}
        <h1 className="text-3xl font-bold text-green-900 mb-2">
          Manage Library Items
        </h1>
        {/*description*/}
        <p className="text-gray-600 mb-8">
          Add or remove books, CDs, and devices from the library system.
        </p>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              {/*top dropdowns*/}
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >
                <option>Add</option>
                <option>Remove</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item Type
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >
                <option>Book</option>
                <option>CD</option>
                <option>Device</option>
              </select>
            </div>
          </div>

          {/*add book form*/}
          {action === "Add" && itemType === "Book" && (
            <form onSubmit={handleAddBook} className="space-y-4">
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                Add Book
              </h2>

              

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Book Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="item_name"
                  placeholder="Enter book title"
                  value={bookForm.item_name}
                  onChange={handleBookChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Type
                </label>
                <input
                  type="text"
                  value="Book"
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author First Name
                </label>
                <input
                  type="text"
                  name="author_firstName"
                  placeholder="Enter author first name"
                  value={bookForm.author_firstName}
                  onChange={handleBookChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author Last Name
                </label>
                <input
                  type="text"
                  name="author_lastName"
                  placeholder="Enter author last name"
                  value={bookForm.author_lastName}
                  onChange={handleBookChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Publisher
                </label>
                <input
                  type="text"
                  name="publisher"
                  placeholder="Enter publisher"
                  value={bookForm.publisher}
                  onChange={handleBookChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Language
                </label>
                <select
                  name="language"
                  placeholder="Enter language"
                  value={bookForm.language}
                  onChange={handleBookChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Select language</option>
                  <option value="1">English</option>
                  <option value="2">Spanish</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year Published
                </label>
                <input
                  type="date"
                  name="year_published"
                  value={bookForm.year_published}
                  onChange={handleBookChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Copies <span className="text-red-600">*</span>
               </label>
               <input
                 type="number"
                 min="1"
                 name="num_copies"
                 value={bookForm.num_copies}
                 onChange={handleBookChange}
                 className="w-full border border-gray-300 rounded-lg px-4 py-3"
                 required
               />
            </div>

              <button 
                type = "submit"
                className="bg-green-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-900"
              >
                Add Book
              </button>
            </form>
          )}

          {/*add cd form */}
          {action === "Add" && itemType === "CD" && (
            <form onSubmit={handleAddCd} className="space-y-4">
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                Add CD
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CD Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="item_name"
                  placeholder="Enter CD title"
                  value={cdForm.item_name}
                  onChange={handleCdChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Type
                </label>
                <input
                  type="text"
                  value="C (CD)"
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CD Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="cd_type"
                  value={cdForm.cd_type}
                  onChange={handleCdChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                >
                  <option value="">Select CD type</option>
                  <option value="1">DVD</option>
                  <option value="2">BluRay</option>
                  <option value="3">CD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating
                </label>
                <select 
                  name="rating"
                  value={cdForm.rating}
                  onChange={handleCdChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3">

                  <option value="">Select rating (optional)</option>
                  <option value="1">Guided (G)</option>
                  <option value="2">PG (P)</option>
                  <option value="3">PG-13 (P13)</option>
                  <option value="4">Restricted (R)</option>
                  <option value="5">Explicit (X)</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  name="genre"
                  value={cdForm.genre}
                  onChange={handleCdChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Select genre</option>

                  {/* Movie genres */}
                  <option value="Action">Action</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Drama">Drama</option>
                  <option value="Horror">Horror</option>
                  <option value="Sci-Fi">Sci-Fi</option>

                  {/* Music genres */}
                  <option value="Rock">Rock</option>
                  <option value="Pop">Pop</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  name = "release_date"
                  value={cdForm.release_date}
                  onChange={handleCdChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Copies <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  name="num_copies"
                  value={cdForm.num_copies}
                  onChange={handleCdChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <button 
                type="submit"
                className="bg-green-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-900"
              >
                Add CD
              </button>
            </form>
          )}

          {/*add device form*/}
          {action === "Add" && itemType === "Device" && (
            <form onSubmit={handleAddDevice} className="space-y-4">
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                Add Device
              </h2>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Device Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name = "name"
                  placeholder="Enter device name"
                  value={deviceForm.name}
                  onChange={handleDeviceChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Type
                </label>
                <input
                  type="text"
                  value="D (Device)"
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Device Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="deviceType"
                  value={deviceForm.deviceType}
                  onChange={handleDeviceChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                >
                  <option value="">Select device type</option>
                  <option value="1">Computer</option>
                  <option value="2">Tablet</option>
                  <option value="3">Laptop</option>
                </select>
              </div>

              <button 
                type="submit"
                className="bg-green-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-900">
                Add Device
              </button>
            </form>
          )}

          {/*removing*/}
          {action === "Remove" && (
            <form onSubmit={handleRemoveItem} className="space-y-4">
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Remove {itemType}
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item ID <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="itemId"
                  value={removeForm.itemId}
                  onChange={handleRemoveChange}
                  placeholder={`Enter ${itemType} item ID`}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Copy ID <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="copyId"
                  value={removeForm.copyId}
                  onChange={handleRemoveChange}
                  placeholder="Enter copy ID"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Removal <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="reason"
                  value={removeForm.reason}
                  onChange={handleRemoveChange}
                  placeholder="Enter reason for removal"
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900"
              >
                Remove {itemType}
              </button>
            </form>
          )}

          {/*required disclaimer at bottom*/}
          <p className="text-sm text-gray-500 mt-8">
            <span className="text-red-600 font-semibold">*</span> indicates a required field.
          </p>
        </div>
      </div>
    </div>
  );
}