

DELIMITER $$
--
-- Procedures
--
CREATE  PROCEDURE `confirm_feeder1` (`orderId` VARCHAR(255), `mother` VARCHAR(255), `child` VARCHAR(255))  BEGIN

UPDATE user SET status = 'paid' WHERE username = child and status = 'free';

UPDATE transactions SET status = 'confirmed' WHERE order_id = orderId;

UPDATE feeder_tree SET status = 'confirmed' WHERE order_id = orderId;


END$$

CREATE  PROCEDURE `confirm_feeder2` (IN `orderId` VARCHAR(255), IN `mother` VARCHAR(255), IN `child` VARCHAR(255), IN `oldid` VARCHAR(255), IN `ord3` VARCHAR(255))  BEGIN

UPDATE transactions SET status = 'confirmed' WHERE order_id = orderId;

UPDATE feeder_tree SET level_two = 'Yes' WHERE order_id = ord3;

UPDATE feeder_tree SET total_l2 = total_l2 + 1 WHERE order_id = oldId;
END$$

CREATE  PROCEDURE `confirm_feeder3` (IN `orderId` VARCHAR(255), IN `mother` VARCHAR(255), IN `child` VARCHAR(255), IN `oldid` VARCHAR(255), IN `ord3` VARCHAR(255))  BEGIN

UPDATE transactions SET status = 'confirmed' WHERE order_id = orderId;

UPDATE feeder_tree SET level_two = 'Yes' WHERE order_id = ord3;

UPDATE feeder_tree SET total_l2 = total_l2 + 1,  sponpd = 'Yes'  WHERE order_id = oldId;
END$$

CREATE  PROCEDURE `leafadd` (IN `matid` VARCHAR(255), IN `mother` VARCHAR(255), IN `orderId` VARCHAR(255), IN `child` VARCHAR(255), IN `spon` VARCHAR(255))  BEGIN

SELECT @myLeft := lft FROM feeder_tree WHERE username = mother;


UPDATE feeder_tree SET rgt = rgt + 2 WHERE rgt > @myLeft;
UPDATE feeder_tree SET lft = lft + 2 WHERE lft > @myLeft;


INSERT INTO feeder_tree(username, sponsor,  lft, rgt,  order_id, matrixid) VALUES(child, spon, @myLeft + 1,  @myLeft + 2,  orderId, matid);



END$$

CREATE  PROCEDURE `leafdel` (IN `orderId` VARCHAR(255), IN `receiving_order` VARCHAR(255))  MODIFIES SQL DATA
BEGIN

SELECT @myLeft := lft, @myRight := rgt, @myWidth := rgt - lft + 1 FROM feeder_tree WHERE order_id = orderId;
DELETE FROM feeder_tree WHERE lft BETWEEN @myLeft AND @myRight;
UPDATE feeder_tree SET rgt = rgt - @myWidth WHERE rgt > @myRight;
UPDATE feeder_tree SET lft = lft - @myWidth WHERE lft > @yRight;
UPDATE transactions set STATUS = 'Not Paid' WHERE order_id = orderId;
DELETE FROM feeder_tree WHERE order_id = orderId;
UPDATE feeder_tree set amount = amount - 1 WHERE order_id = receiving_order;
END$$

CREATE  PROCEDURE `leafdel2` (IN `orderId` VARCHAR(255), IN `receiving_order` VARCHAR(255))  MODIFIES SQL DATA
BEGIN

UPDATE transactions set STATUS = 'Not Paid' WHERE order_id = orderId;
UPDATE feeder_tree SET level_two = 'No', order2 = NULL WHERE order_id = orderId;
UPDATE feeder_tree set totalamount = totalamount - 1 WHERE order_id = receiving_order;
END$$

CREATE  PROCEDURE `leafdel3` (IN `orderId` VARCHAR(255), IN `receiving_order` VARCHAR(255))  MODIFIES SQL DATA
BEGIN 
UPDATE transactions set status = 'Not Paid' WHERE order_id = orderId; 
UPDATE feeder_tree SET level_two = 'No', order2 = NULL WHERE order_id = orderId;
UPDATE feeder_tree set totalamount = totalamount - 1 WHERE order_id = receiving_order;
UPDATE feeder_tree set sponpd = 'No' WHERE order_id = receiving_order; 
END$$

CREATE  PROCEDURE `placefeeder` (IN `child` VARCHAR(255), IN `reason` VARCHAR(255), IN `spon` VARCHAR(255), IN `mother` VARCHAR(255), IN `orderId` VARCHAR(255), IN `dateEntered` VARCHAR(255), IN `oldId` VARCHAR(255))  BEGIN

SELECT @bankname := bank_name, @fullname := full_name, @accountname := account_name, @accountnumber := account_number, @phone := phone FROM user WHERE username = mother;

SELECT @payerfullname := full_name, @payerphone := phone, @payerusername := username FROM user WHERE username = child;

UPDATE feeder_tree SET amount = amount + 1 WHERE order_id = oldId;

INSERT INTO transactions ( amount, purpose, payer_fullname, payer_username, payer_phone, receiver_fullname, receiver_username, receiver_phone, receiver_bank_name, receiver_account_name, receiver_account_number, status, order_id, expire, receiving_order) Values (10000, reason, @payerfullname, @payerusername, @payerphone, @fullname, mother, @phone, @bankname, @accountname, @accountnumber, 'pending', orderId, dateEntered, oldId);


END$$

CREATE  PROCEDURE `placefeeder1` (IN `child` VARCHAR(255), IN `reason` VARCHAR(255), IN `spon` VARCHAR(255), IN `mother` VARCHAR(255), IN `orderId` VARCHAR(255), IN `dateEntered` VARCHAR(255), IN `oldId` VARCHAR(255), IN `ord3` VARCHAR(255))  BEGIN

SELECT @bankname := bank_name, @fullname := full_name, @accountname := account_name, @accountnumber := account_number, @phone := phone FROM user WHERE username = mother;

SELECT @payerfullname := full_name, @payerphone := phone, @payerusername := username FROM user WHERE username = child;

UPDATE feeder_tree SET totalamount = totalamount + 1 WHERE order_id = oldId;

UPDATE feeder_tree SET level_two = 'pending' WHERE order_id = ord3;

INSERT INTO transactions ( amount, purpose, payer_fullname, payer_username, payer_phone, receiver_fullname, receiver_username, receiver_phone, receiver_bank_name, receiver_account_name, receiver_account_number, status, order_id, expire, receiving_order) Values (15000, reason, @payerfullname, @payerusername, @payerphone, @fullname, mother, @phone, @bankname, @accountname, @accountnumber, 'pending', orderId, dateEntered, oldId);


END$$

CREATE  PROCEDURE `placefeeder2` (IN `child` VARCHAR(255), IN `reason` VARCHAR(255), IN `spon` VARCHAR(255), IN `mother` VARCHAR(255), IN `orderId` VARCHAR(255), IN `dateEntered` VARCHAR(255), IN `oldId` VARCHAR(255), IN `ord3` VARCHAR(255))  BEGIN

SELECT @bankname := bank_name, @fullname := full_name, @accountname := account_name, @accountnumber := account_number, @phone := phone FROM user WHERE username = spon;

SELECT @payerfullname := full_name, @payerphone := phone, @payerusername := username FROM user WHERE username = child;

UPDATE feeder_tree SET totalamount = totalamount + 1 WHERE order_id = oldId;

UPDATE feeder_tree SET level_two = 'pending', sponpd = 'pending' WHERE order_id = ord3;

UPDATE feeder_tree SET sponpd = 'pending' WHERE order_id = oldId;


INSERT INTO transactions (behalf, amount, purpose, payer_fullname, payer_username, payer_phone, receiver_fullname, receiver_username, receiver_phone, receiver_bank_name, receiver_account_name, receiver_account_number, status, order_id, expire, receiving_order) Values (mother, 15000, reason, @payerfullname, @payerusername, @payerphone, @fullname, spon, @phone, @bankname, @accountname, @accountnumber, 'pending', orderId, dateEntered, oldId);


END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `default_sponsor`
--

CREATE TABLE `default_sponsor` (
  `username` varchar(255) NOT NULL,
  `id` int(11) NOT NULL,
  `amount` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `feeder_tree`
--

CREATE TABLE `feeder_tree` (
  `sponsor` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `restricted` varchar(255) NOT NULL DEFAULT 'No',
  `totalamount` int(11) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'PENDING',
  `order_id` varchar(255) NOT NULL,
  `amount` int(11) NOT NULL DEFAULT 0,
  `matrixid` varchar(255) NOT NULL,
  `level_two` varchar(255) DEFAULT 'No',
  `order2` varchar(255) DEFAULT NULL,
  `total_l2` int(11) NOT NULL DEFAULT 0,
  `sponpd` varchar(255) NOT NULL DEFAULT 'No',
  `lft` int(11) NOT NULL,
  `rgt` int(11) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `ftree`
--

CREATE TABLE `ftree` (
  `username` varchar(255) NOT NULL,
  `orderid` varchar(255) NOT NULL,
  `a` varchar(255) DEFAULT NULL,
  `b` varchar(255) DEFAULT NULL,
  `aa` varchar(255) DEFAULT NULL,
  `ab` varchar(255) DEFAULT NULL,
  `ba` varchar(255) DEFAULT NULL,
  `bb` varchar(255) DEFAULT NULL,
  `matrix` varchar(255) NOT NULL DEFAULT 'incomplete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `passwordreset`
--

CREATE TABLE `passwordreset` (
  `email` varchar(255) NOT NULL,
  `link` int(255) NOT NULL,
  `stat` varchar(255) NOT NULL DEFAULT 'Active',
  `date_entered` datetime NOT NULL DEFAULT current_timestamp(),
  `expire` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `user` varchar(255) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `bitcoin_wallet` varchar(255) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_number` bigint(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `restrict`
--

CREATE TABLE `restrict` (
  `username` varchar(255) NOT NULL,
  `date_entered` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `testimonies`
--

CREATE TABLE `testimonies` (
  `username` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `testimony` varchar(255) DEFAULT NULL,
  `date_entered` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `receiver_fullname` varchar(255) NOT NULL,
  `receiver_username` varchar(255) NOT NULL,
  `receiver_phone` bigint(10) NOT NULL,
  `receiver_bank_name` varchar(255) NOT NULL,
  `receiver_account_name` varchar(255) NOT NULL,
  `receiver_account_number` bigint(10) NOT NULL,
  `payer_fullname` varchar(255) NOT NULL,
  `payer_username` varchar(255) NOT NULL,
  `payer_phone` bigint(10) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `amount` int(11) NOT NULL,
  `expire` datetime NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'PENDING',
  `order_id` varchar(255) NOT NULL,
  `behalf` varchar(255) DEFAULT NULL,
  `pop` varchar(255) DEFAULT NULL,
  `receiving_order` varchar(255) DEFAULT NULL,
  `date_entered` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'free',
  `sponsor` varchar(255) DEFAULT NULL,
  `verification` varchar(255) NOT NULL DEFAULT 'No',
  `activation` varchar(255) NOT NULL DEFAULT 'No',
  `profile` varchar(255) NOT NULL DEFAULT 'No',
  `bitcoin` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `account_number` bigint(20) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `user_type` varchar(255) DEFAULT 'user',
  `date_joined` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `verifyemail`
--

CREATE TABLE `verifyemail` (
  `email` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `default_sponsor`
--
ALTER TABLE `default_sponsor`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD UNIQUE KEY `user` (`user`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `verifyemail`
--
ALTER TABLE `verifyemail`
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
