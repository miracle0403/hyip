CREATE TABLE `default_sponsor` (
  `username` varchar(255) NOT NULL,
  id INT(11) NOT NULL,
  `amount` int(11) NOT NULL DEFAULT 0
);

CREATE TABLE `passwordreset` (
  `email` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL,
  `stat` varchar(255) NOT NULL DEFAULT 'Active',
  `date_entered` datetime NOT NULL DEFAULT current_timestamp(),
  `expire` datetime NOT NULL
);

CREATE TABLE `restrict` (
  `username` varchar(255) NOT NULL,
  `date_entered` datetime NOT NULL DEFAULT current_timestamp()
);

CREATE TABLE `transactions` (
  `user` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `method_of_payment` varchar(255) NOT NULL,
  `phone` bigint(10) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `bitcoin_wallet` varchar(255) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_number` bigint(10) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'PENDING',
  `pop` varchar(255) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `date_entered` datetime NOT NULL DEFAULT current_timestamp()
);


CREATE TABLE `payment` (
`user` varchar(255) NOT NULL,
`bank_name` varchar(255) NOT NULL,
  `bitcoin_wallet` varchar(255) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_number` bigint(10) NOT NULL
);



CREATE TABLE `user` (
  `user_id` int(11) AUTO_INCREMENT NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `password` varchar (255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'free',
  `sponsor` varchar (255) DEFAULT NULL,
  `verification` varchar (255) NOT NULL DEFAULT 'No',
   `profile` varchar (255) NOT NULL DEFAULT 'No',
  `user_type` varchar(255) DEFAULT 'user',
  `date_joined` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
);

CREATE TABLE `verifyemail` (
  `email` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp()
);

ALTER TABLE `payment`
 
  ADD UNIQUE KEY `user` (`user`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);
  
  ALTER TABLE `verifyemail`
  ADD UNIQUE KEY `email` (`email`);
  
 ALTER TABLE `default_sponsor` 
  ADD PRIMARY KEY (`id`),