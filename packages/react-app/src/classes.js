import Moralis from "moralis";

// Need a super to edit the ACL and grant
// public read on some fields
export class CustomUser extends Moralis.User {
  profilePicture;

  // eslint-disable-next-line no-useless-constructor
  constructor(attributes) {
    super(attributes);
  }
}

export const MessageObject = Moralis.Object.extend("Message");
export const ChatObject = Moralis.Object.extend("Chat");
export const PostObject = Moralis.Object.extend("Post");
export const OfferObject = Moralis.Object.extend("Offer");
export const ContractObject = Moralis.Object.extend("Contract");
