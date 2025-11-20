import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { NetworkDAO } from "@dao/NetworkDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class NetworkRepository {
    private repo: Repository<NetworkDAO>;

    constructor() {
        this.repo = AppDataSource.getRepository(NetworkDAO);
    }

    getAllNetworks(): Promise<NetworkDAO[]> {
        return this.repo.find({relations: ["gateways", "gateways.sensors"]});
    }

    async getNetworkByCode(code: string): Promise<NetworkDAO> {
        return findOrThrowNotFound(
            await this.repo.find({ where: { code: code },
                                   relations: ["gateways", "gateways.sensors"] }),
            () => true,
            `Network with code '${code}' not found`
        );
    }

    async createNetwork(
        code: string,
        name?: string,
        description?: string
    ): Promise<NetworkDAO> {
        throwConflictIfFound(
            await this.repo.find({ where: { code: code } }),
            () => true,
            `Network with code '${code}' already exists`
        );

        return this.repo.save({
            code: code,
            name: name,
            description: description
        });
    }

    async updateNetwork(
        codeToUpdate: string,
        code?: string,
        name?: string,
        description?: string
    ): Promise<NetworkDAO> {
        let network = findOrThrowNotFound(
            await this.repo.find({ where: { code: codeToUpdate } }),
            () => true,
            `Network with code '${codeToUpdate}' not found`
        );

        if (code !== undefined) {
            throwConflictIfFound(
                await this.repo.find({ where: { code: code } }),
                () => true,
                `Network with code '${code}' already exists`
            );
            network.code = code
        }
        if (description !== undefined) { network.description = description }
        if (name !== undefined) { network.name = name }

        return this.repo.save(network);
    }

    async deleteNetwork(code: string): Promise<void> {
        await this.repo.remove(await this.getNetworkByCode(code));
    }

}
