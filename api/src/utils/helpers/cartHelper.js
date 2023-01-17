import * as crypto from "crypto";
import get from "lodash/get.js";
export const genCartToken = () => {
    return crypto.randomBytes(64).toString('hex')
};

export const updateCartItems = (updateItem, currentItems) => {
    const index = currentItems.findIndex(
        (item) => item.dish_id === updateItem.dish_id
    );
    if (index === -1) {
        currentItems.push(updateItem);
    } else {
        currentItems[index].quantity += updateItem.quantity;
        const updateOptionItems = get(updateItem, "options", []);
        for (const option of updateOptionItems) {
            const currentItemsOptionIndex = get(
                currentItems[index],
                "options",
                []
            ).findIndex((item) => item.id === option.id);
            if (currentItemsOptionIndex === -1) {
                continue;
            }

            const currentItemsOption =
                currentItems[index].options[currentItemsOptionIndex];
            const currentItemsOptionItems = get(
                currentItemsOption,
                "option_items",
                []
            );
            const requestOptionItems = get(option, "option_items", []);

            for (const requestOptionItem of requestOptionItems) {
                const currentItemsOptionItemIndex = currentItemsOptionItems.findIndex(
                    (item) => item.id === requestOptionItem.id
                );
                if (currentItemsOptionItemIndex === -1) {
                    continue;
                }
                const currentItemsOptionItem =
                    currentItemsOptionItems[currentItemsOptionItemIndex];
                currentItemsOptionItem.quantity += requestOptionItem.quantity;

                currentItems[index].options[currentItemsOptionIndex].option_items[
                    currentItemsOptionItemIndex
                    ] = currentItemsOptionItem;
            }
        }
    }
    return currentItems;
}
