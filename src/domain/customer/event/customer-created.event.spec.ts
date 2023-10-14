import EventDispatcher from "../../@shared/event/event-dispatcher";
import SendConsoleLog1Handler from "./handler/send-console-log1.handler";
import SendConsoleLog2Handler from "./handler/send-console-log2.handler";
import Customer from "../entity/customer";
import CustomerCreatedEvent from "./customer-created.event";

describe("CustomerCreatedEvent unit tests", () => {
    let eventDispatcher: EventDispatcher;
    let eventHandler1: SendConsoleLog1Handler;
    let eventHandler2: SendConsoleLog2Handler;

    beforeEach(() => {
        eventDispatcher = new EventDispatcher();
        eventHandler1 = new SendConsoleLog1Handler();
        eventHandler2 = new SendConsoleLog2Handler;
        eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
        eventDispatcher.register("CustomerCreatedEvent", eventHandler2);
    });

    it("should register event handlers", () => {
        const handlers = eventDispatcher.getEventHandlers["CustomerCreatedEvent"];

        expect(handlers).toBeDefined();
        expect(handlers.length).toBe(2);
        expect(handlers).toContain(eventHandler1);
        expect(handlers).toContain(eventHandler2);
    });

    it("should notify all event handlers", () => {
        const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
        const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

        const customer = new Customer("1", "Customer");
        const customerCreatedEvent = new CustomerCreatedEvent(customer);

        eventDispatcher.notify(customerCreatedEvent);

        expect(spyEventHandler1).toHaveBeenCalledWith(customerCreatedEvent);
        expect(spyEventHandler2).toHaveBeenCalledWith(customerCreatedEvent);
    });

    it("should not notify if handler is unregistered", () => {
        const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
        eventDispatcher.unregister("CustomerCreatedEvent", eventHandler1);

        const customer = new Customer("1", "Customer");
        const customerCreatedEvent = new CustomerCreatedEvent(customer);

        eventDispatcher.notify(customerCreatedEvent);

        expect(spyEventHandler1).not.toHaveBeenCalled();
    });

    it("should notify multiple events correctly", () => {
        const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
        const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

        const customer1 = new Customer("1", "Customer1");
        const customer2 = new Customer("2", "Customer2");
        const customerCreatedEvent1 = new CustomerCreatedEvent(customer1);
        const customerCreatedEvent2 = new CustomerCreatedEvent(customer2);

        eventDispatcher.notify(customerCreatedEvent1);
        eventDispatcher.notify(customerCreatedEvent2);

        expect(spyEventHandler1).toHaveBeenCalledWith(customerCreatedEvent1);
        expect(spyEventHandler1).toHaveBeenCalledWith(customerCreatedEvent2);
        expect(spyEventHandler2).toHaveBeenCalledWith(customerCreatedEvent1);
        expect(spyEventHandler2).toHaveBeenCalledWith(customerCreatedEvent2);
    });
});
