import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
        "1",
        product.name,
        product.price,
        product.id,
        2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("deve fazer update em uma order existente", async () => {

    // Criando um cliente e um produto de exemplo
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    // Criando um pedido inicial com pelo menos um item
    const orderItem = new OrderItem(
        "1",
        product.name,
        product.price,
        product.id,
        2
    );
    const initialOrder = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(initialOrder);

    // Criando um novo item para adicionar ao pedido
    const newOrderItem = new OrderItem(
        "2",
        "Updated Product",
        20,
        product.id,
        3
    );

    // Criando um novo objeto Order com os valores atualizados
    const updatedOrder = new Order(initialOrder.id, initialOrder.customerId, [
      ...initialOrder.items,
      newOrderItem,
    ]);

    // Atualizando o pedido no banco de dados
    await orderRepository.update(updatedOrder);

    // Recuperando o pedido atualizado do banco de dados
    const retrievedOrder = await orderRepository.find(updatedOrder.id);

    // Verificando se as informações foram atualizadas corretamente
    expect(retrievedOrder.customerId).toBe(customer.id);
    expect(retrievedOrder.items.length).toBe(2); // Agora temos dois itens
    expect(retrievedOrder.items[1].name).toBe("Updated Product"); // Verificando o novo item
    expect(retrievedOrder.items[1].quantity).toBe(3);

    // Verificando também o primeiro item
    expect(retrievedOrder.items[0].name).toBe(product.name);
    expect(retrievedOrder.items[0].quantity).toBe(2);
  });

  it("should find an order by ID", async () => {

    // Criando um cliente de exemplo
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    // Criando um produto de exemplo
    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    // Criando um pedido de exemplo com pelo menos um item
    const orderItem = new OrderItem(
        "1",
        product.name,
        product.price,
        product.id,
        2
    );
    const order = new Order("123", customer.id, [orderItem]);

    // Inserindo o pedido de exemplo no banco de dados
    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    // Encontrando o pedido pelo ID
    const foundOrder = await orderRepository.find(order.id);

    // Verificando se o pedido encontrado pelo ID corresponde ao pedido de exemplo
    expect(foundOrder.id).toBe(order.id);
    expect(foundOrder.customerId).toBe(order.customerId);
    // Verificando outros atributos se necessário
  });


  it("should find all orders", async () => {

    // Criando vários clientes de exemplo
    const customerRepository = new CustomerRepository();
    const customers = [
      new Customer("1", "Customer 1"),
      new Customer("2", "Customer 2"),
      new Customer("3", "Customer 3"),
    ];
    for (const customer of customers) {
      const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
      customer.changeAddress(address);
      await customerRepository.create(customer);
    }

    // Criando vários produtos de exemplo
    const productRepository = new ProductRepository();
    const products = [
      new Product("1", "Product 1", 10),
      new Product("2", "Product 2", 15),
      new Product("3", "Product 3", 20),
    ];
    for (const product of products) {
      await productRepository.create(product);
    }

    // Criando vários pedidos de exemplo com pelo menos um item cada
    const orders = [
      new Order("1", customers[0].id, [new OrderItem("1", products[0].name, products[0].price, products[0].id, 2)]),
      new Order("2", customers[1].id, [new OrderItem("2", products[1].name, products[1].price, products[1].id, 3)]),
      new Order("3", customers[2].id, [new OrderItem("3", products[2].name, products[2].price, products[2].id, 1)]),
    ];

    // Inserindo os pedidos de exemplo no banco de dados
    const orderRepository = new OrderRepository();
    for (const order of orders) {
      await orderRepository.create(order);
    }

    // Encontrando todos os pedidos
    const allOrders = await orderRepository.findAll();

    // Verificando se o número de pedidos encontrados é igual ao número de pedidos criados
    expect(allOrders.length).toBe(orders.length);

    // Verificando se os IDs dos pedidos encontrados correspondem aos IDs dos pedidos criados
    for (const order of allOrders) {
      expect(orders.map((o) => o.id)).toContain(order.id);
    }
  });

});
