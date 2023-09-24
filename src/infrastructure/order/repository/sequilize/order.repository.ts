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
        // Atualizando o pedido (excluindo a atualização de 'items')
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

        // Removendo todos os itens do pedido existentes no banco de dados
        await OrderItemModel.destroy({
            where: {
                order_id: entity.id,
            },
        });

        // Adicionando os novos itens do pedido ao banco de dados
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
            // Buscando o pedido no banco de dados usando o ID fornecido.
            orderModel = await OrderModel.findOne({
                where: {
                    id,
                },
                rejectOnEmpty: true,
                include: ["items"], // Incluindo os itens associados ao pedido.
            });
        } catch (error) {
            // Se houver um erro, lança uma exceção indicando que o pedido não foi encontrado.
            throw new Error("Order not found");
        }

        // Mapeando os dados do modelo do pedido para um objeto Order e o retorna.
        const order = new Order(
            id,
            orderModel.customer_id,
            orderModel.items.map((item) => new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity))
        );

        return order;
    }


    async findAll(): Promise<Order[]> {
        // Buscando todos os pedidos no banco de dados, incluindo os itens associados a cada pedido.
        const orderModels = await OrderModel.findAll({
            include: ["items"],
        });

        // Mapeando os dados dos modelos de pedidos para objetos Order e retorna um array de pedidos.
        const orders = orderModels.map((orderModel) => {
            return new Order(
                orderModel.id,
                orderModel.customer_id,
                orderModel.items.map((item) =>
                    new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
                )
            );
        });

        return orders;
    }

}
