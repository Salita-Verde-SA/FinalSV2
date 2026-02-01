"""OrderDetail service with foreign key validation and stock management."""
import logging
from sqlalchemy.orm import Session
from sqlalchemy import select

from models.order_detail import OrderDetailModel
from models.product import ProductModel
from repositories.order_detail_repository import OrderDetailRepository
from repositories.order_repository import OrderRepository
from repositories.product_repository import ProductRepository
from repositories.base_repository_impl import InstanceNotFoundError
from schemas.order_detail_schema import OrderDetailSchema
from services.base_service_impl import BaseServiceImpl
from utils.logging_utils import get_sanitized_logger

logger = get_sanitized_logger(__name__)

class OrderDetailService(BaseServiceImpl):
    """Service for OrderDetail entity with validation and stock management."""

    def __init__(self, db: Session):
        super().__init__(
            repository_class=OrderDetailRepository,
            model=OrderDetailModel,
            schema=OrderDetailSchema,
            db=db
        )
        self._order_repository = OrderRepository(db)
        self._product_repository = ProductRepository(db)

    def save(self, schema: OrderDetailSchema) -> OrderDetailSchema:
        """Crea un detalle de pedido con validación de stock y bloqueo pesimista."""
        # Validar existencia de la orden
        try:
            self._order_repository.find(schema.order_id)
        except InstanceNotFoundError:
            raise InstanceNotFoundError(f"Order with id {schema.order_id} not found")

        # BLOQUEO PESIMISTA: Evita race conditions (HU-O02)
        stmt = select(ProductModel).where(
            ProductModel.id_key == schema.product_id
        ).with_for_update()

        product_model = self._product_repository.session.execute(stmt).scalar_one_or_none()

        if product_model is None:
            raise InstanceNotFoundError(f"Product with id {schema.product_id} not found")

        # Validar stock disponible (HU-O02)
        if product_model.stock < schema.quantity:
            raise ValueError(f"Stock insuficiente. Disponible: {product_model.stock}, Solicitado: {schema.quantity}")

        # Validar coincidencia de precio para prevenir fraude (HU-O02)
        if abs(schema.price - product_model.price) > 0.01:
            raise ValueError(f"Discrepancia de precio. Esperado: {product_model.price}, Recibido: {schema.price}")

        # Descuento atómico de stock
        product_model.stock -= schema.quantity
        logger.info(f"Stock descontado para producto {schema.product_id}. Nuevo stock: {product_model.stock}")

        return super().save(schema)