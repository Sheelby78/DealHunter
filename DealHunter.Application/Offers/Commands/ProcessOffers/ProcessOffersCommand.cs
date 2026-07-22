using DealHunter.Application.DTOs;
using MediatR;

namespace DealHunter.Application.Offers.Commands.ProcessOffers;

public record ProcessOffersCommand : IRequest<ProcessOffersResult>;
