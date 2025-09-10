CREATE DEFINER=`root`@`localhost` PROCEDURE `StockAfterInsertUpdate`()
BEGIN
IF (select count(1) from 
		(select sum(qty) as qty from stock
group by productId, uomId 
having qty < 0)e ) > 0 THEN 
           CALL `NEGATIVE STOCK ERROR`;
END IF;
END