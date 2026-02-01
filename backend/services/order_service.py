"""OrderService with stock restoration logic."""
import logging
from sqlalchemy.orm import Session
from models.order import OrderModel
from models.order_detail import OrderDetailModel
from models.product import ProductModel
from repositories.order_repository import OrderRepository
from schemas.order_schema import OrderSchema
from services.base_service_impl import BaseServiceImpl
from utils.logging_utils import get_sanitized_logger

logger = get_sanitized_logger(__name__)

class OrderService(BaseServiceImpl):
    """Service for Order entity with validation and restoration logic."""

    def __init__(self, db: Session):
        super().__init__(
            repository_class=OrderRepository,
            model=OrderModel,
            schema=OrderSchema,
            db=db
        )

    def update(self, id_key: int, schema: OrderSchema) -> OrderSchema:
        """Actualiza la orden y restaura stock si se cancela (HU-O04)."""
        current_order = self._db.query(OrderModel).filter(OrderModel.id_key == id_key).first()
        
        # Restauración de stock: si pasa a CANCELED (estado 4) y no lo estaba
        if schema.status == 4 and current_order.status != 4:
            details = self._db.query(OrderDetailModel).filter(OrderDetailModel.order_id == id_key).all()
            for detail in details:
                product = self._db.query(ProductModel).filter(ProductModel.id_key == detail.product_id).first()
                if product:
                    product.stock += detail.quantity
                    logger.info(f"Stock restaurado para producto {product.id_key}: +{detail.quantity}")

        return super().update(id_key, schema)