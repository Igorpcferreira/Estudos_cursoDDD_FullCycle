import Order from "../../../../domain/checkout/entity/order";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItem from "../../../../domain/checkout/entity/order_item";

export default class OrderRepository implements OrderRepositoryInterface{
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

    async update(entity: Order): Promise<void> {
        // Atualize o pedido (excluindo a atualização de 'items')
        await OrderModel.update(
            {
                customer_id: entity.customerId,
                total: entity.total(),
            },
            {
                where: {
                    id: entity.id,
                },
            }
        );

        // Remova todos os itens do pedido existentes no banco de dados
        await OrderItemModel.destroy({
            where: {
                order_id: entity.id,
            },
        });

        // Adicione os novos itens do pedido ao banco de dados
        await OrderItemModel.bulkCreate(
            entity.items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                product_id: item.productId,
                quantity: item.quantity,
                order_id: entity.id,
            }))
        );
    }


    async find(id: string): Promise<Order> {
        let orderModel;
        try {
            orderModel = await OrderModel.findOne({
                where: {
                    id,
                },
                rejectOnEmpty: true,
                include: ["items"],
            });
        } catch (error) {
            throw new Error("Order not found");
        }

        const order = new Order(id, orderModel.customer_id, orderModel.items
            .map((item) => new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)));

        return order;
    }


    async findAll(): Promise<Order[]> {
        const orderModels = await OrderModel.findAll({
            include: ["items"],
        });

        const orders = orderModels.map((orderModel) => {
            return new Order(orderModel.id, orderModel.customer_id, orderModel.items
                .map((item) => new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)));
        });

        return orders;
    }
}
