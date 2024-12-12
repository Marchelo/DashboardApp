import { SaveButton, useForm } from "@refinedev/antd";
import { HttpError } from "@refinedev/core";
import { GetFields, GetVariables } from "@refinedev/nestjs-query";

import { CloseOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Form, Input, Spin } from "antd";

import { getNameInitials } from "@/utilities";
import { UPDATE_USER_MUTATION } from "@/graphql/mutations";

import { Text } from "../text";
import CustomAvatar from "../custom-avatar";

import {
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from "@/graphql/types";

type Props = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  userId: string;
};

export const AccountSettings = ({ opened, setOpened, userId }: Props) => {
  /**
   * useForm - upravljanje obrascima
   * saveButtonProps - sadrzi sve potrebne rekvizite za dugme posalji(ucitavanje, onemoguceno, onClick...)
   * formProps - instanca HTML forme koja upravlja stanjem obrasca i radnjama kao sto su onFinish,  onValuesChange...
   * queryResult - rezyktat upita.. isLoading, podaci, greske... 

  */
  const { saveButtonProps, formProps, queryResult } = useForm<
    /**
     * getFields - dobijanje polja mutacija (mejl, naslov posla, i br fona)
     * 
     */
    GetFields<UpdateUserMutation>,
    // tip koji predstavlja gresku koristi se za ODREDJIVANJE VRSTE GRESKE koju mutacija moze da izazove
    HttpError,
    // odredjivanje tipa prom za updateUserMutation
    GetVariables<UpdateUserMutationVariables>
  >({
    /**
    mutationMode - kako treba da se izvrsi mutacija(optimistic, pesimistic...)
    optimistic - preusmeravanje i azuriranje gui-a se izvrsava ODMAH kao da je mutacija uspesna
    pesimistic - preusmeravanje i azuriranje gui-a se izvrsava NAKON kao da je mutacija uspesna
     */
    mutationMode: "optimistic",
    /**
    specificira se akcija koja se treba izvrsiti nad resursom
    ako nije navedeno Refine ce sam odrediti ime resursa prema trenutnoj ruti 
     */
    resource: "users",
    /**
    specificira se akcija koja se treba izvrsiti nad resursom. Refine ispod haube poziva useOne hook da dobije podatke o korisniku u svrhu editovanja istih
     */
    action: "edit",
    id: userId,
    /**
    koristi se za pruzanje dodatnih info davaocu podataka
     */
    meta: {
      // gqlMutation se koristi da specificira koje mutacije treba da se izvrse  
      gqlMutation: UPDATE_USER_MUTATION,
    },
  });
  const { avatarUrl, name } = queryResult?.data?.data || {};

  const closeModal = () => {
    setOpened(false);
  };

  // ako se query izvrsava pokazi mi loading idendifikator
  if (queryResult?.isLoading) {
    return (
      <Drawer
        open={opened}
        width={756}
        styles={{
          body: {
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <Spin />
      </Drawer>
    );
  }

  return (
    <Drawer
      onClose={closeModal}
      open={opened}
      width={756}
      styles={{
        body: { background: "#f5f5f5", padding: 0 },
        header: { display: "none" },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          backgroundColor: "#fff",
        }}
      >
        <Text strong>Account Settings</Text>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => closeModal()}
        />
      </div>
      <div
        style={{
          padding: "16px",
        }}
      >
        <Card>
          <Form {...formProps} layout="vertical">
            <CustomAvatar
              shape="square"
              src={avatarUrl}
              name={getNameInitials(name || "")}
              style={{
                width: 96,
                height: 96,
                marginBottom: "24px",
              }}
            />
            <Form.Item label="Name" name="name">
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input placeholder="email" />
            </Form.Item>
            <Form.Item label="Job title" name="jobTitle">
              <Input placeholder="jobTitle" />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input placeholder="Timezone" />
            </Form.Item>
          </Form>
          <SaveButton
            {...saveButtonProps}
            style={{
              display: "block",
              marginLeft: "auto",
            }}
          />
        </Card>
      </div>
    </Drawer>
  );
};