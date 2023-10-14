import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerChangeAddressEvent from "../customer-change-address.event";

export default class SendConsoleLogHandler implements EventHandlerInterface<CustomerChangeAddressEvent> {
    handle(event: CustomerChangeAddressEvent): void {
        const { customerId, customerName, newAddress } = event.eventData;

        console.log(`Customer ${customerId}, ${customerName} had their address updated to ${newAddress}`)
    }
}