import EventDispatcher from "../../@shared/event/event-dispatcher";
import Address from "../value-object/address";
import CustomerFactory from "../factory/customer.factory";
import CustomerChangeAddressEvent from "./customer-change-address.event";
import SendConsoleLogHandler from "./handler/send-console-log.handler";

describe("CustomerChangeAddressEvent unit tests", () => {
    let eventDispatcher: EventDispatcher;
    let eventHandler: SendConsoleLogHandler;

    beforeEach(() => {
        eventDispatcher = new EventDispatcher();
        eventHandler = new SendConsoleLogHandler();
        eventDispatcher.register("CustomerChangeAddressEvent", eventHandler);
    });

    it("should register a handler for CustomerChangeAddressEvent", () => {
        const handlers = eventDispatcher.getEventHandlers["CustomerChangeAddressEvent"];

        expect(handlers).toBeDefined();
        expect(handlers.length).toBe(1);
        expect(handlers[0]).toBe(eventHandler);
    });

    it("should notify a customer change address", () => {
        const spyEventHandler = jest.spyOn(eventHandler, "handle");

        const address = new Address("street", 1, "zip", "city");
        const customer = CustomerFactory.createWithAddress("Customer", address);
        const customerChangeAddressEvent = new CustomerChangeAddressEvent(customer);

        eventDispatcher.notify(customerChangeAddressEvent);

        expect(spyEventHandler).toHaveBeenCalledWith(customerChangeAddressEvent);
    });

    it("should not notify if no handler is registered", () => {
        const spyEventHandler = jest.spyOn(eventHandler, "handle");
        eventDispatcher.unregister("CustomerChangeAddressEvent", eventHandler);

        const address = new Address("street", 1, "zip", "city");
        const customer = CustomerFactory.createWithAddress("Customer", address);
        const customerChangeAddressEvent = new CustomerChangeAddressEvent(customer);

        eventDispatcher.notify(customerChangeAddressEvent);

        expect(spyEventHandler).not.toHaveBeenCalled();
    });
});



