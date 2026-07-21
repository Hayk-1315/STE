// apps/api/src/sea/delegated/delegated.controller.ts
//
// REST surface for delegated CMR (additive; sea.controller.ts is untouched).
// Read endpoints are always safe; write endpoints (grant prepare/finalize,
// revoke) 403 whenever the feature is disabled (default) or the profile is
// read-only / base-mainnet. No user keys or secrets are ever accepted or
// returned — only addresses, an enable digest, and the user's own signature.
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { DelegationService } from './delegation.service';
import {
  attemptsQuerySchema,
  finalizeGrantBodySchema,
  grantsQuerySchema,
  prepareGrantBodySchema,
  revokeGrantBodySchema,
  saStatusQuerySchema,
} from './dto/delegated.dto';

@Controller('sea/delegated')
export class DelegatedController {
  constructor(private readonly svc: DelegationService) {}

  @Get('capabilities')
  async capabilities() {
    return this.svc.capabilities();
  }

  private assertEnabled(): void {
    if (!this.svc.status().enabled) {
      throw new ForbiddenException('delegated_disabled');
    }
  }

  // Read-only Nexus SA setup facts (NEXUS_SA). No tx/signing; enabled-gated
  // because it needs the provider + session signer to derive the SA.
  @Get('sa-status')
  async saStatus(@Query() query: unknown) {
    this.assertEnabled();
    const parsed = saStatusQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.svc.saStatus(parsed.data);
  }

  @Post('grant/prepare')
  async prepareGrant(@Body() body: unknown) {
    this.assertEnabled();
    const parsed = prepareGrantBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.svc.prepareGrant(parsed.data);
  }

  @Post('grant/finalize')
  async finalizeGrant(@Body() body: unknown) {
    this.assertEnabled();
    const parsed = finalizeGrantBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.svc.finalizeGrant(parsed.data);
  }

  @Post('revoke/prepare')
  async revokePrepare(@Body() body: unknown) {
    this.assertEnabled();
    const parsed = revokeGrantBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.svc.revoke(parsed.data);
  }

  // Read-only: an owner's delegated grants (the FE uses this to render delegated
  // row actions instead of manual Execute-now, and to show grant status).
  @Get('grants')
  async grants(@Query() query: unknown) {
    this.assertEnabled();
    const parsed = grantsQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.svc.listGrants(parsed.data.owner);
  }

  // Read-only: delegated execution attempts for one intent (owner-scoped).
  @Get('attempts')
  async attempts(@Query() query: unknown) {
    this.assertEnabled();
    const parsed = attemptsQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'invalid_payload',
        issues: parsed.error.issues,
      });
    }
    return this.svc.listAttempts(parsed.data.owner, parsed.data.intentId);
  }
}
