import axios from 'axios';
import { urlsServices } from '../../configs/urlsConfig';
//fundo a fundo
export const APIBottomToBottom = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
//meta
export const APIGoal = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
//Emenda Estadual
export const APIStateAmendment = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
//Tesouro Estadual
export const APIStateTreasury = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
// FDD
export const APIFdd = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
// Eixos
export const APIAxle = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
//Autor
export const APIAuthor = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
// Convenio/autor
export const APICovenantAuthor = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
// Convenio
export const APICovenants = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
// Destinação/Objetos
export const APIDestinationObjects = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
// obejtos do recurso
export const APIObjectResource = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
// Entrega do obejto
export const APIDeliveryObject = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
// obejtos
export const APIObject = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
// natureza
export const APINature = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
//modelo
export const APIModel = axios.create({
  baseURL: urlsServices.BACKENDWS,
});
