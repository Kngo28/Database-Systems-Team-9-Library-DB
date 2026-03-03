

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;


CREATE TABLE IF NOT EXISTS Item (
  Item_ID   INT PRIMARY KEY,
  Item_name VARCHAR(50),
  Item_type SMALLINT
);

CREATE TABLE IF NOT EXISTS Book (
  Item_ID           INT PRIMARY KEY,
  author_firstName  VARCHAR(50),
  author_lastName   VARCHAR(50),
  publisher         VARCHAR(50),
  language          SMALLINT,
  year_published    DATE,
  Book_damage_fine  DECIMAL(10,2),
  Book_loss_fine    DECIMAL(10,2),
  FOREIGN KEY (Item_ID) REFERENCES Item(Item_ID)
);

CREATE TABLE IF NOT EXISTS CD (
  Item_ID         INT PRIMARY KEY,
  CD_type         SMALLINT,
  rating          SMALLINT,
  release_date    DATE,
  CD_damage_fine  DECIMAL(10,2),
  CD_loss_fine    DECIMAL(10,2),
  FOREIGN KEY (Item_ID) REFERENCES Item(Item_ID)
);


CREATE TABLE IF NOT EXISTS Device (
  Item_ID              INT PRIMARY KEY,
  Device_type          SMALLINT,
  Device_damage_fine   DECIMAL(10,2),
  Device_loss_fine     DECIMAL(10,2),
  FOREIGN KEY (Item_ID) REFERENCES Item(Item_ID)
);


CREATE TABLE IF NOT EXISTS Copy (
  Copy_ID      INT PRIMARY KEY,
  Item_ID      INT,
  Copy_status  SMALLINT,
  FOREIGN KEY (Item_ID) REFERENCES Item(Item_ID)
);


CREATE TABLE IF NOT EXISTS Person (
  Person_ID       INT PRIMARY KEY,
  First_name      VARCHAR(50),
  Last_name       VARCHAR(50),
  email           VARCHAR(50),
  username        VARCHAR(50),
  password        VARCHAR(50),
  role            SMALLINT,
  phone_number    INT,
  birthday        DATE,
  account_status  SMALLINT,
  borrow_status   SMALLINT
);

CREATE TABLE IF NOT EXISTS Staff (
  Person_ID          INT PRIMARY KEY,
  Staff_permissions  SMALLINT,
  FOREIGN KEY (Person_ID) REFERENCES Person(Person_ID)
);


CREATE TABLE IF NOT EXISTS User (
  Person_ID         INT PRIMARY KEY,
  User_permissions  SMALLINT,
  FOREIGN KEY (Person_ID) REFERENCES Person(Person_ID)
);


CREATE TABLE IF NOT EXISTS BorrowedItem (
  BorrowedItem_ID  INT PRIMARY KEY,
  borrow_date      DATE,
  returnBy_date    DATE,
  Person_ID        INT,
  Copy_ID          INT,
  FOREIGN KEY (Person_ID) REFERENCES Person(Person_ID),
  FOREIGN KEY (Copy_ID) REFERENCES Copy(Copy_ID)
);


CREATE TABLE IF NOT EXISTS HoldItem (
  Hold_ID       INT PRIMARY KEY,
  queue_status  SMALLINT,
  Person_ID     INT,
  Copy_ID       INT,
  FOREIGN KEY (Person_ID) REFERENCES Person(Person_ID),
  FOREIGN KEY (Copy_ID) REFERENCES Copy(Copy_ID)
);

CREATE TABLE IF NOT EXISTS Room (
  Room_ID      INT PRIMARY KEY,
  Room_status  SMALLINT
);


CREATE TABLE IF NOT EXISTS RoomReservation (
  Reservation_ID  INT PRIMARY KEY,
  start_time      DATETIME,
  length          TIME,
  Person_ID       INT,
  Room_ID         INT,
  FOREIGN KEY (Person_ID) REFERENCES Person(Person_ID),
  FOREIGN KEY (Room_ID) REFERENCES Room(Room_ID)
);


CREATE TABLE IF NOT EXISTS FeeOwed (
  Fine_ID          INT PRIMARY KEY,
  date_owed        DATETIME,
  status           SMALLINT,
  late_fee         DECIMAL(10,2),
  Person_ID        INT,
  BorrowedItem_ID  INT,
  FOREIGN KEY (Person_ID) REFERENCES Person(Person_ID),
  FOREIGN KEY (BorrowedItem_ID) REFERENCES BorrowedItem(BorrowedItem_ID)
);


CREATE TABLE IF NOT EXISTS FeePayment (
  Payment_ID    INT PRIMARY KEY,
  Payment_Date  DATE,
  method        SMALLINT,
  Person_ID     INT,
  Fine_ID       INT UNIQUE,
  FOREIGN KEY (Person_ID) REFERENCES Person(Person_ID),
  FOREIGN KEY (Fine_ID) REFERENCES FeeOwed(Fine_ID)
);