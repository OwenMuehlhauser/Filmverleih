"use strict"

import DatabaseFactory from "../database.js";
import {ObjectId} from "mongodb";

/**
 * Geschäftslogik zur Verwaltung von Adressen. Diese Klasse implementiert die
 * eigentliche Anwendungslogik losgelöst vom technischen Übertragungsweg.
 * Die Adressen werden der Einfachheit halber in einer MongoDB abgelegt.
 */
export default class AddRatingService {
    /**
     * Konstruktor.
     */
    constructor() {
        this._ratings = DatabaseFactory.database.collection("ratings");
    }

    /**
     * Adressen suchen. Unterstützt wird lediglich eine ganz einfache Suche,
     * bei der einzelne Felder auf exakte Übereinstimmung geprüft werden.
     * Zwar unterstützt MongoDB prinzipiell beliebig komplexe Suchanfragen.
     * Um das Beispiel klein zu halten, wird dies hier aber nicht unterstützt.
     *
     * @param {Object} query Optionale Suchparameter
     * @return {Promise} Liste der gefundenen Adressen
     */
    async search(query) {
        let cursor = this._ratings.find(query, {
            sort: {
                movieTitle_rate: 1,
            }
        });

        return cursor.toArray();
    }

    /**
     * Speichern einer neuen Adresse.
     *
     * @param {Object} rating Zu speichernde Adressdaten
     * @return {Promise} Gespeicherte Adressdaten
     */
    async create(rating) {
        rating = rating || {};

        let newRating = {
            movieTitle_rate: rating.movieTitle_rate || "",
            rate:  rating.rate  || "",
        };

        let result = await this._ratings.insertOne(newRating);
        return await this._ratings.findOne({_id: result.insertedId});
    }

    /**
     * Auslesen einer vorhandenen Adresse anhand ihrer ID.
     *
     * @param {String} id ID der gesuchten Adresse
     * @return {Promise} Gefundene Adressdaten
     */
    async read(id) {
        let result = await this._ratings.findOne({_id: new ObjectId(id)});
        return result;
    }

    /**
     * Aktualisierung einer Adresse, durch Überschreiben einzelner Felder
     * oder des gesamten Adressobjekts (ohne die ID).
     *
     * @param {String} id ID der gesuchten Adresse
     * @param {[type]} rate Zu speichernde Adressdaten
     * @return {Promise} Gespeicherte Adressdaten oder undefined
     */
    async update(id, rate) {
        let oldRate = await this._ratings.findOne({_id: new ObjectId(id)});
        if (!oldRate) return;

        let updateDoc = {
            $set: {},
        }

        if (rate.movieTitle_rate) updateDoc.$set.movieTitle_rate = rate.movieTitle_rate;
        if (rate.rate)  updateDoc.$set.rate  = rate.rate;

        await this._ratings.updateOne({_id: new ObjectId(id)}, updateDoc);
        return this._ratings.findOne({_id: new ObjectId(id)});
    }

    /**
     * Löschen einer Adresse anhand ihrer ID.
     *
     * @param {String} id ID der gesuchten Adresse
     * @return {Promise} Anzahl der gelöschten Datensätze
     */
    async delete(id) {
        let result = await this._ratings.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}
